<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Student;
use App\Models\EntryLog;
use App\Services\QRCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DeviceController extends Controller
{
    protected $qrCodeService;

    public function __construct(QRCodeService $qrCodeService)
    {
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Get all devices with student information (for admin) or student's own devices (for students)
     */
    public function index(Request $request)
    {
        $status = $request->query('status'); // pending, active, all
        $user = $request->user();
        
        // Ensure relationships are correctly defined in the Device model:
        // 'student' -> belongs to Student::class
        // 'admin' -> belongs to Admin::class (using 'approved_by' column)
        // 'qrCodes' -> hasMany QrCode::class
        $query = Device::with(['student', 'admin']); // Removed 'qrCodes' from eager loading in index for efficiency if not strictly needed immediately
        
        // --- Admin/Student Authorization Logic ---
        $isAdmin = false;
        if ($user) {
            // NOTE: The logic below assumes the authenticated user is an instance of Student model
            // or has access to 'course' and 'email' properties for role detection.
            if (isset($user->course)) {
                $isAdmin = strtolower($user->course) === 'admin';
            }
            if (!$isAdmin && isset($user->email)) {
                $isAdmin = str_contains(strtolower($user->email), 'admin@devpass');
            }
            
            // If not admin, filter by student_id
            if (!$isAdmin) {
                $query->where('student_id', $user->id);
            }
        }
        
        // --- Status Filtering ---
        if ($status && $status !== 'all') {
            $query->where('registration_status', $status);
        }
        
        $devices = $query->orderBy('registration_date', 'desc')->get();
        
        // Format response for frontend
        $formatted = $devices->map(function ($device) {
            // Use the correct primary key name: 'laptop_id'
            $idKey = 'laptop_id';
            
            // Eager load qrCodes only when needed inside the map, or better, fetch outside.
            // Assuming QrCode model has a device_id column that maps to Device's laptop_id
            $latestQR = $device->qrCodes()->where('is_active', true)->latest('expires_at')->first();
            
            // Get last scanned timestamp from entry_log
            $lastScanned = null;
            if ($latestQR) {
                $lastEntry = EntryLog::where('qr_code_hash', $latestQR->qr_code_hash)
                    ->where('status', 'success')
                    ->latest('scan_timestamp')
                    ->first();
                
                if ($lastEntry && $lastEntry->scan_timestamp) {
                    $lastScanned = $lastEntry->scan_timestamp->format('M d, Y h:i A');
                }
            }
            
            return [
                // CHANGED: Primary key is 'laptop_id' in your schema
                'id' => $device->$idKey, 
                'studentName' => $device->student->name ?? 'Unknown',
                'studentId' => $device->student->id ?? 'N/A',
                'course' => $device->student->course ?? 'N/A',
                // REMOVED 'type' as it's not in the schema, using 'model'/'brand' instead
                'brand' => $device->brand,
                'model' => $device->model,
                'serialNumber' => $device->serial_number,
                'status' => $device->registration_status,
                'registrationDate' => $device->registration_date ? $device->registration_date->format('Y-m-d') : null,
                'qrExpiry' => $latestQR && $latestQR->expires_at ? $latestQR->expires_at->format('Y-m-d') : null,
                'qrCodeHash' => $latestQR ? $latestQR->qr_code_hash : null,
                'lastScanned' => $lastScanned,
            ];
        });
        
        return response()->json($formatted);
    }

    /**
     * Get device statistics
     */
    public function stats()
    {
        $total = Device::count();
        $pending = Device::where('registration_status', 'pending')->count();
        $active = Device::where('registration_status', 'active')->count();
        
        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'active' => $active,
        ]);
    }

    /**
     * Approve a device
     */
    public function approve($id)
    {
        // CHANGED: Use 'laptop_id' for findOrFail if that is the model's primary key
        $device = Device::findOrFail($id); 
        $user = Auth::user();
        
        // --- Admin Check ---
        $isAdmin = false;
        if (isset($user->course)) {
            $isAdmin = strtolower($user->course) === 'admin';
        }
        if (!$isAdmin && isset($user->email)) {
            $isAdmin = str_contains(strtolower($user->email), 'admin@devpass');
        }
        
        if (!$isAdmin) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }
        
        // Get admin ID from admins table
        // NOTE: This logic assumes the authenticated $user object (Student model) has an 'email'
        // and that an Admin record exists with that email and has an 'admin_id' primary key.
        $adminId = null;
        if (isset($user->email)) {
            $admin = \App\Models\Admin::where('email', $user->email)->first();
            if ($admin) {
                $adminId = $admin->admin_id; // Match the foreign key 'approved_by' in devices table
            }
        }
        
        // Fallback or error handling if adminId is not found might be needed here
        // For simplicity, we proceed with potentially null if user isn't found in Admin model
        
        $device->registration_status = 'active';
        $device->approved_by = $adminId;
        $device->approved_at = Carbon::now();
        $device->save();
        
        // Create QR code for the device
        $qrCode = $this->qrCodeService->createQRCode([
            // CHANGED: Use the correct primary key 'laptop_id'
            'laptop_id' => $device->laptop_id, 
            'expires_at' => Carbon::now()->addMonth(),
            'is_active' => true,
        ]);
        
        return response()->json([
            'message' => 'Device approved successfully',
            'device' => $device,
            'qr_code' => $qrCode
        ]);
    }

    /**
     * Reject a device
     */
    public function reject($id)
    {
        $device = Device::findOrFail($id);
        $user = Auth::user();
        
        // Check if user is admin (same logic as approve)
        $isAdmin = false;
        if (isset($user->course)) {
            $isAdmin = strtolower($user->course) === 'admin';
        }
        if (!$isAdmin && isset($user->email)) {
            $isAdmin = str_contains(strtolower($user->email), 'admin@devpass');
        }
        
        if (!$isAdmin) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }
        
        $device->registration_status = 'rejected';
        $device->save();
        
        return response()->json([
            'message' => 'Device rejected successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // CHANGED: Validation only includes fields present in the 'devices' migration schema
        $validated = $request->validate([
            // NOTE: 'device_type' is not in the schema. Assuming 'model' or 'brand' covers the device description.
            // If you need to differentiate device types (Laptop/PC/Tablet), you must add 'device_type' to the migration.
            'brand' => 'nullable|string|max:50',
            'model' => 'required|string|max:100', // 'model' is unique per schema
            'serial_number' => 'nullable|string|max:100',
        ]);

        $student = $request->user();
        
        $device = Device::create([
            'student_id' => $student->id,
            // Removed 'device_type' if it's not in the schema
            'brand' => $validated['brand'] ?? null,
            'model' => $validated['model'], // Model is required and unique
            'serial_number' => $validated['serial_number'] ?? null,
            // Removed all PC component fields (processor, motherboard, memory, etc.)
            'registration_date' => Carbon::now(),
            'registration_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Device registered successfully',
            'device' => $device
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $device = Device::with(['student', 'admin', 'qrCodes'])->findOrFail($id);
        $latestQR = $device->qrCodes()->where('is_active', true)->latest('expires_at')->first();
        
        return response()->json([
            // CHANGED: Primary key is 'laptop_id' in your schema
            // 'id' => $device->laptop_id, 
            'studentName' => $device->student->name ?? 'Unknown',
            'studentId' => $device->student->id ?? 'N/A',
            'course' => $device->student->course ?? 'N/A',
            // REMOVED 'type'
            'brand' => $device->brand,
            'model' => $device->model,
            'serialNumber' => $device->serial_number,
            'status' => $device->registration_status,
            'registrationDate' => $device->registration_date ? $device->registration_date->format('Y-m-d') : null,
            'qrExpiry' => $latestQR && $latestQR->expires_at ? $latestQR->expires_at->format('Y-m-d') : null,
        ]);
    }
}