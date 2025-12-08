<?php

namespace App\Http\Controllers;

use App\Models\EntryLog;
use App\Models\QRCode;
use App\Models\Gate;
use App\Models\SecurityGuard;
use App\Services\EntryLogService;
use App\Services\QRCodeService;
use App\Services\GateService;
use App\Services\SecurityGuardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DeviceEntryController extends Controller
{
    protected $entryLogService;
    protected $qrCodeService;
    protected $gateService;
    protected $securityGuardService;

    public function __construct(EntryLogService $entryLogService, QRCodeService $qrCodeService, GateService $gateService, SecurityGuardService $securityGuardService)
    {
        $this->entryLogService = $entryLogService;
        $this->qrCodeService = $qrCodeService;
        $this->gateService = $gateService;
        $this->securityGuardService = $securityGuardService;
    }

    /**
     * Get recent scan entries (for admin and personnel)
     */
    public function index(Request $request)
    {
        $limit = $request->query('limit', 50);
        $gateName = $request->query('gate');
        
        // Get current security guard if authenticated user is security personnel
        $user = Auth::user();
        $securityGuardId = null;
        if ($user && isset($user->email)) {
            $securityGuard = SecurityGuard::where('email', $user->email)->first();
            if ($securityGuard) {
                $securityGuardId = $securityGuard->guard_id;
            }
        }
        
        $gate = null;
        if ($gateName) {
            $gate = $this->gateService->getGateByName($gateName);
        }
        
        // If gate is specified and user is security guard, filter by both gate and security guard
        // This ensures each security guard only sees their own scans for the selected gate
        $entries = $gate 
            ? $this->entryLogService->getEntryLogsByGate($gate->gate_id, $limit, $securityGuardId)
            : $this->entryLogService->getAllEntryLogs($limit, $securityGuardId);
        
        $formatted = $entries->map(function ($entry) {
            $device = $entry->qrCode->device ?? null;
            $student = $device->student ?? null;
            
            return [
                'id' => $entry->log_id,
                'studentName' => $student->name ?? 'Unknown',
                'studentId' => $student->id ?? 'N/A',
                // 'studentDepartment' => $student->department ?? 'N/A',
                'studentCourse' => $student->course ?? 'N/A',
                'device' => $device ? ($device->brand . ' ' . $device->model) : 'N/A',
                'deviceType' => $device->device_type ?? 'N/A',
                'deviceSerial' => $device->serial_number ?? 'N/A',
                'gate' => $entry->gate->gate_name ?? 'N/A',
                'gateLocation' => $entry->gate->location ?? 'N/A',
                'time' => $entry->scan_timestamp ? $entry->scan_timestamp->format('h:i A') : 'N/A',
                'date' => $entry->scan_timestamp ? $entry->scan_timestamp->format('M d, Y') : 'N/A',
                'fullTimestamp' => $entry->scan_timestamp ? $entry->scan_timestamp->format('M d, Y h:i A') : 'N/A',
                'status' => $entry->status,
                'securityGuard' => $entry->securityGuard->name ?? 'Unknown',
                'securityGuardId' => $entry->securityGuard->guard_id ?? 'N/A',
            ];
        });
        
        return response()->json($formatted);
    }

    /**
     * Read QR code without logging (for preview)
     */
    public function readQR(Request $request)
    {
        $validated = $request->validate([
            'qr_hash' => 'required|string',
        ]);

        // Find QR code
        $qrCode = $this->qrCodeService->getQRCodeByHash($validated['qr_hash']);
        
        if (!$qrCode) {
            return response()->json([
                'valid' => false,
                'message' => 'QR code not found in system',
                'student_data' => null,
                'device' => null
            ], 404);
        }

        if (!$this->qrCodeService->isQRCodeValid($validated['qr_hash'])) {
            return response()->json([
                'valid' => false,
                'message' => 'QR code is expired or inactive',
                'student_data' => null,
                'device' => null
            ], 400);
        }

        $device = $qrCode->device;
        $student = $device->student ?? null;

        return response()->json([
            'valid' => true,
            'message' => 'QR code is valid',
            'student_data' => $student ? [
                'student_name' => $student->name,
                'student_id' => $student->id,
                // 'student_department' => $student->department,
                'student_course' => $student->course,
            ] : null,
            'device' => $device ? [
                'brand' => $device->brand,
                'model' => $device->model,
                'device_type' => $device->device_type,
            ] : null,
        ]);
    }

    /**
     * Validate QR code and create entry (for personnel) - logs as accepted
     */
    public function validateQR(Request $request)
    {
        $validated = $request->validate([
            'qr_hash' => 'required|string',
            'gate_name' => 'required|string',
        ]);

        // Find QR code
        $qrCode = $this->qrCodeService->getQRCodeByHash($validated['qr_hash']);
        
        if (!$qrCode || !$this->qrCodeService->isQRCodeValid($validated['qr_hash'])) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Invalid or expired QR code',
            ], 400);
        }

        // Get or create gate
        $gate = $this->gateService->getGateByName($validated['gate_name']);
        if (!$gate) {
            $gate = $this->gateService->createGate(['gate_name' => $validated['gate_name']]);
        }

        // Get current security guard (from authenticated user)
        $user = Auth::user();
        $securityGuardId = 'SEC001'; // Default
        if ($user && isset($user->email)) {
            // Try to find security guard by email
            $securityGuard = SecurityGuard::where('email', $user->email)->first();
            if ($securityGuard) {
                $securityGuardId = $securityGuard->guard_id;
            } else {
                // Create security guard if doesn't exist
                $securityGuard = $this->securityGuardService->createSecurityGuard([
                    'guard_id' => 'SEC' . str_pad(SecurityGuard::count() + 1, 3, '0', STR_PAD_LEFT),
                    'name' => $user->name ?? 'Security Guard',
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                ]);
                $securityGuardId = $securityGuard->guard_id;
            }
        }

        // Create entry log with success status
        $entryLog = $this->entryLogService->createEntryLog([
            'qr_code_hash' => $validated['qr_hash'],
            'gate_id' => $gate->gate_id,
            'security_guard_id' => $securityGuardId,
            'status' => 'success',
        ]);

        $device = $qrCode->device;
        $student = $device->student ?? null;

        return response()->json([
            'status' => 'success',
            'valid' => true,
            'message' => 'Device verified successfully',
            'student_data' => $student ? [
                'student_name' => $student->name,
                'student_id' => $student->id,
                // 'student_department' => $student->department,
                'student_course' => $student->course,
            ] : null,
            'device' => $device ? [
                'brand' => $device->brand,
                'model' => $device->model,
                'device_type' => $device->device_type,
            ] : null,
            'data' => [
                'name' => $student->name ?? 'Unknown',
                'studentId' => $student->id ?? 'N/A',
                'device' => $device ? ($device->brand . ' ' . $device->model) : 'N/A',
                'expiryDate' => $qrCode->expires_at ? $qrCode->expires_at->format('Y-m-d') : null,
            ],
        ]);
    }

    /**
     * Deny access and log as denied
     */
    public function denyQR(Request $request)
    {
        $validated = $request->validate([
            'qr_hash' => 'required|string',
            'gate_name' => 'required|string',
        ]);

        // Find QR code
        $qrCode = $this->qrCodeService->getQRCodeByHash($validated['qr_hash']);
        
        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR code not found',
            ], 404);
        }

        // Get or create gate
        $gate = $this->gateService->getGateByName($validated['gate_name']);
        if (!$gate) {
            $gate = $this->gateService->createGate(['gate_name' => $validated['gate_name']]);
        }

        // Get current security guard
        $user = Auth::user();
        $securityGuardId = 'SEC001'; // Default
        if ($user && isset($user->email)) {
            // Try to find security guard by email
            $securityGuard = SecurityGuard::where('email', $user->email)->first();
            if ($securityGuard) {
                $securityGuardId = $securityGuard->guard_id;
            } else {
                // Create security guard if doesn't exist
                $securityGuard = $this->securityGuardService->createSecurityGuard([
                    'guard_id' => 'SEC' . str_pad(SecurityGuard::count() + 1, 3, '0', STR_PAD_LEFT),
                    'name' => $user->name ?? 'Security Guard',
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                ]);
                $securityGuardId = $securityGuard->guard_id;
            }
        }

        // Create entry log with failed status
        $entryLog = $this->entryLogService->createEntryLog([
            'qr_code_hash' => $validated['qr_hash'],
            'gate_id' => $gate->gate_id,
            'security_guard_id' => $securityGuardId,
            'status' => 'failed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Access denied and logged',
        ]);
    }

    /**
     * Get recent activity for student (their own scan history)
     */
    public function studentActivity(Request $request)
    {
        $user = Auth::user();
        $limit = $request->query('limit', 20);
        
        if (!$user || !isset($user->id)) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }
        
        $entries = $this->entryLogService->getEntryLogsByStudent($user->id, $limit);
        
        $formatted = $entries->map(function ($entry) {
            $device = $entry->qrCode->device ?? null;
            $student = $device->student ?? null;
            
            return [
                'id' => $entry->log_id,
                'gate' => $entry->gate->gate_name ?? 'Unknown Gate',
                'gateLocation' => $entry->gate->location ?? 'N/A',
                'time' => $entry->scan_timestamp 
                    ? $entry->scan_timestamp->format('M d, Y h:i A') 
                    : 'N/A',
                'date' => $entry->scan_timestamp ? $entry->scan_timestamp->format('M d, Y') : 'N/A',
                'fullTimestamp' => $entry->scan_timestamp ? $entry->scan_timestamp->format('M d, Y h:i A') : 'N/A',
                'device' => $device ? ($device->brand . ' ' . $device->model) : 'Unknown Device',
                'deviceType' => $device->device_type ?? 'N/A',
                'deviceSerial' => $device->serial_number ?? 'N/A',
                'studentName' => $student->name ?? 'Unknown',
                'studentId' => $student->id ?? 'N/A',
                // 'studentDepartment' => $student->department ?? 'N/A',
                'studentCourse' => $student->course ?? 'N/A',
                'status' => $entry->status,
                'securityGuard' => $entry->securityGuard->name ?? 'Unknown',
                'securityGuardId' => $entry->securityGuard->guard_id ?? 'N/A',
            ];
        });
        
        return response()->json($formatted);
    }

    /**
     * Get statistics for personnel dashboard
     */
    public function stats(Request $request)
    {
        $gateName = $request->query('gate');
        
        // Get current security guard if authenticated user is security personnel
        $user = Auth::user();
        $securityGuardId = null;
        if ($user && isset($user->email)) {
            $securityGuard = SecurityGuard::where('email', $user->email)->first();
            if ($securityGuard) {
                $securityGuardId = $securityGuard->guard_id;
            }
        }
        
        $gate = null;
        if ($gateName) {
            $gate = $this->gateService->getGateByName($gateName);
        }
        
        // Filter stats by both gate and security guard
        // This ensures each security guard only sees their own statistics for the selected gate
        $stats = $this->entryLogService->getStats(
            $gate ? $gate->gate_id : null, 
            null, 
            $securityGuardId
        );
        
        return response()->json($stats);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'qr_code_hash' => 'required|exists:qr_codes,qr_code_hash',
            'gate_id' => 'required|exists:gates,gate_id',
            'security_guard_id' => 'required|exists:security_guards,guard_id',
            'status' => 'required|in:success,failed',
        ]);

        $entryLog = $this->entryLogService->createEntryLog($validated);

        return response()->json([
            'message' => 'Entry recorded successfully',
            'entry' => $entryLog
        ], 201);
    }
}
