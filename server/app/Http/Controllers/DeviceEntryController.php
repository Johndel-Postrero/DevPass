<?php

namespace App\Http\Controllers;

use App\Models\EntryLog;
use App\Models\QRCode;
use App\Models\Gate;
use App\Models\SecurityGuard;
use App\Models\Device;
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
        
        // Relationships are already eager loaded in EntryLogService, no need to load again
        
        $formatted = $entries->map(function ($entry) {
            // Safely get device and student with proper null checking
            $device = null;
            $student = null;
            
            try {
                // Check if qrCode relationship exists and is loaded
                if ($entry->relationLoaded('qrCode') && $entry->qrCode) {
                    // Check if device relationship exists and is loaded
                    if ($entry->qrCode->relationLoaded('device') && $entry->qrCode->device) {
                        $device = $entry->qrCode->device;
                        // Check if student relationship exists and is loaded
                        if ($device->relationLoaded('student') && $device->student) {
                            $student = $device->student;
                        }
                    }
                }
            } catch (\Exception $e) {
                // Log error but don't break the entire response
                \Log::warning('Error loading device/student for entry log: ' . $entry->log_id, [
                    'error' => $e->getMessage(),
                    'entry_id' => $entry->log_id,
                    'trace' => $e->getTraceAsString()
                ]);
            }
            
            // Safely get gate and security guard
            $gate = null;
            $securityGuard = null;
            
            try {
                if ($entry->relationLoaded('gate') && $entry->gate) {
                    $gate = $entry->gate;
                }
                if ($entry->relationLoaded('securityGuard') && $entry->securityGuard) {
                    $securityGuard = $entry->securityGuard;
                }
            } catch (\Exception $e) {
                \Log::warning('Error loading gate/securityGuard for entry log: ' . $entry->log_id, [
                    'error' => $e->getMessage()
                ]);
            }
            
            // Get course name safely
            $courseName = 'N/A';
            if ($student && $student->course) {
                $courseName = $student->course->course_name ?? $student->course->course_code ?? 'N/A';
            }
            
            return [
                'id' => $entry->log_id,
                'studentName' => ($student && isset($student->name)) ? $student->name : 'Unknown',
                'studentId' => ($student && isset($student->student_id)) ? $student->student_id : (($student && isset($student->id)) ? $student->id : 'N/A'),
                // 'studentDepartment' => $student->department ?? 'N/A',
                'studentCourse' => $courseName,
                'device' => $device ? ($device->brand . ' ' . $device->model) : 'N/A',
                'deviceType' => 'Laptop', // Per database diagram: system handles laptops only (device_type removed)
                'deviceSerial' => ($device && isset($device->serial_number)) ? $device->serial_number : 'N/A',
                'gate' => ($gate && isset($gate->gate_name)) ? $gate->gate_name : 'N/A',
                'gateLocation' => ($gate && isset($gate->location)) ? $gate->location : 'N/A',
                'time' => $entry->scan_timestamp ? $entry->scan_timestamp->setTimezone(config('app.timezone'))->format('h:i A') : 'N/A',
                'date' => $entry->scan_timestamp ? $entry->scan_timestamp->setTimezone(config('app.timezone'))->format('M d, Y') : 'N/A',
                'fullTimestamp' => $entry->scan_timestamp ? $entry->scan_timestamp->setTimezone(config('app.timezone'))->format('M d, Y h:i A') : 'N/A',
                'status' => $entry->status ?? 'unknown',
                'securityGuard' => ($securityGuard && isset($securityGuard->name)) ? $securityGuard->name : 'Unknown',
                'securityGuardId' => ($securityGuard && isset($securityGuard->guard_id)) ? $securityGuard->guard_id : 'N/A',
            ];
        });
        
        return response()->json($formatted);
    }

    /**
     * Read QR code without logging (for preview)
     */
    public function readQR(Request $request)
    {
        try {
            $validated = $request->validate([
                'qr_hash' => 'required|string',
            ]);

            // Find QR code (including those with soft-deleted devices)
            $qrCode = QRCode::where('qr_code_hash', $validated['qr_hash'])
                ->with(['device' => function($query) {
                    $query->withTrashed(); // Include soft-deleted devices
                }])
                ->first();
            
            if (!$qrCode) {
                return response()->json([
                    'valid' => false,
                    'message' => 'QR code is not registered in the system. This QR code does not exist in our database.',
                    'student_data' => null,
                    'device' => null
                ], 404);
            }

            // Check if QR code is expired - show error, no popup (check before device validation)
            if ($qrCode->expires_at && $qrCode->expires_at->isPast()) {
                return response()->json([
                    'valid' => false,
                    'message' => 'QR code has expired. Please renew the QR code.',
                    'student_data' => null,
                    'device' => null
                ], 400);
            }

            // Check if QR code is inactive
            if (!$qrCode->is_active) {
                return response()->json([
                    'valid' => false,
                    'message' => 'QR code is inactive. This device may have been deactivated.',
                    'student_data' => null,
                    'device' => null
                ], 400);
            }

            // Check if device exists
            $device = $qrCode->device;
            if (!$device) {
                // Deactivate orphaned QR code
                $qrCode->is_active = false;
                $qrCode->save();
                return response()->json([
                    'valid' => false,
                    'message' => 'Device not found. This QR code is not associated with any device.',
                    'student_data' => null,
                    'device' => null
                ], 404);
            }

            // Check if device is soft-deleted - show error, no popup
            if ($device->trashed() || $device->deleted_at !== null) {
                // Deactivate QR code for deleted device
                $qrCode->is_active = false;
                $qrCode->save();
                return response()->json([
                    'valid' => false,
                    'message' => 'This device has been deleted. The QR code is no longer valid.',
                    'student_data' => null,
                    'device' => null
                ], 400);
            }

            // Note: Rejected devices are allowed - they can still be accepted/rejected by security
            // Only deleted, not registered, and expired show errors without popup

            // Check if student exists
            $student = $device->student ?? null;
            if (!$student) {
                // Deactivate QR code for device without student
                $qrCode->is_active = false;
                $qrCode->save();
                return response()->json([
                    'valid' => false,
                    'message' => 'Student not found. This device is not associated with any student.',
                    'student_data' => null,
                    'device' => null
                ], 404);
            }

            // Load course relationship if not already loaded
            if (!$student->relationLoaded('course')) {
                $student->load('course');
            }

            // Get course name safely
            $courseName = 'N/A';
            if ($student->course) {
                $courseName = $student->course->course_name ?? $student->course->course_code ?? 'N/A';
            }

            return response()->json([
                'valid' => true,
                'message' => 'QR code is valid',
                'student_data' => [
                    'student_name' => $student->name ?? 'Unknown',
                    'student_id' => $student->student_id ?? $student->id ?? 'N/A',
                    'student_course' => $courseName,
                ],
                'device' => [
                    'brand' => $device->brand ?? 'Unknown',
                    'model' => $device->model ?? 'Unknown',
                    'device_type' => 'Laptop', // Per database diagram: system handles laptops only
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid request. Please provide a valid QR code hash.',
                'student_data' => null,
                'device' => null
            ], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            // Database connection or query errors
            \Log::error('Database error reading QR code: ' . $e->getMessage(), [
                'qr_hash' => $request->input('qr_hash'),
                'code' => $e->getCode(),
                'sql' => $e->getSql() ?? 'N/A',
            ]);
            return response()->json([
                'valid' => false,
                'message' => 'Database error occurred. Please check the server connection and try again.',
                'student_data' => null,
                'device' => null
            ], 500);
        } catch (\Exception $e) {
            // Log detailed error information
            \Log::error('Error reading QR code: ' . $e->getMessage(), [
                'qr_hash' => $request->input('qr_hash'),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'valid' => false,
                'message' => 'An error occurred while reading the QR code. Please try again.',
                'student_data' => null,
                'device' => null
            ], 500);
        }
    }

    /**
     * Validate QR code and create entry (for personnel) - logs as accepted
     */
    public function validateQR(Request $request)
    {
        $qrCode = null;
        $device = null;
        $student = null;
        
        try {
            $validated = $request->validate([
                'qr_hash' => 'required|string',
                'gate_name' => 'required|string',
            ]);

            // Find QR code (including those with soft-deleted devices)
            $qrCode = QRCode::where('qr_code_hash', $validated['qr_hash'])
                ->with(['device' => function($query) {
                    $query->withTrashed(); // Include soft-deleted devices
                }])
                ->first();
            
            // Check if QR code exists
            if (!$qrCode) {
                return response()->json([
                    'status' => 'failed',
                    'success' => false,
                    'valid' => false,
                    'message' => 'QR code is not registered in the system. This QR code does not exist in our database.',
                ], 404);
            }

            // Check if QR code is expired - show error, no popup (check before device validation)
            if ($qrCode->expires_at && $qrCode->expires_at->isPast()) {
                return response()->json([
                    'status' => 'failed',
                    'success' => false,
                    'valid' => false,
                    'message' => 'QR code has expired. Please renew the QR code.',
                ], 400);
            }

            // Check if QR code is inactive
            if (!$qrCode->is_active) {
                return response()->json([
                    'status' => 'failed',
                    'success' => false,
                    'valid' => false,
                    'message' => 'QR code is inactive. This device may have been deactivated.',
                ], 400);
            }

            // Check if device exists
            $device = $qrCode->device;
            if (!$device) {
                // Deactivate orphaned QR code
                $qrCode->is_active = false;
                $qrCode->save();
                return response()->json([
                    'status' => 'failed',
                    'success' => false,
                    'valid' => false,
                    'message' => 'Device not found. This QR code is not associated with any device.',
                ], 404);
            }

            // Check if device is soft-deleted - show error, no popup
            if ($device->trashed() || $device->deleted_at !== null) {
                // Deactivate QR code for deleted device
                $qrCode->is_active = false;
                $qrCode->save();
                return response()->json([
                    'status' => 'failed',
                    'success' => false,
                    'valid' => false,
                    'message' => 'This device has been deleted. The QR code is no longer valid.',
                ], 400);
            }

            // Note: Rejected devices are allowed - they can still be accepted/rejected by security
            // Only deleted, not registered, and expired show errors without popup
            // Active and rejected devices will show the accept/reject popup

            // Get student for later use (device is already set above)
            $student = $device->student ?? null;
            
            // Check if student exists
            if (!$student) {
                // Deactivate QR code for device without student
                $qrCode->is_active = false;
                $qrCode->save();
                return response()->json([
                    'status' => 'failed',
                    'success' => false,
                    'valid' => false,
                    'message' => 'Student not found. This device is not associated with any student.',
                ], 404);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'failed',
                'success' => false,
                'valid' => false,
                'message' => 'Invalid request. Please provide valid QR code hash and gate name.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error validating QR code (initial validation): ' . $e->getMessage(), [
                'qr_hash' => $request->input('qr_hash'),
                'gate_name' => $request->input('gate_name'),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'failed',
                'success' => false,
                'valid' => false,
                'message' => 'An error occurred while validating the QR code. Please try again.',
            ], 500);
        }

        // Get or create gate
        try {
            $gate = $this->gateService->getGateByName($validated['gate_name']);
            if (!$gate) {
                // Create gate with required fields (location is required)
                $gate = $this->gateService->createGate([
                    'gate_name' => $validated['gate_name'],
                    'location' => 'Main Campus', // Default location if not specified
                    'is_active' => true
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error getting/creating gate: ' . $e->getMessage(), [
                'gate_name' => $validated['gate_name'],
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'failed',
                'success' => false,
                'valid' => false,
                'message' => 'Error processing gate information. Please try again.',
            ], 500);
        }

        // Get current security guard (from authenticated user)
        try {
            $user = Auth::user();
            $securityGuardId = 'SEC001'; // Default
            if ($user && isset($user->email)) {
                // Try to find security guard by email
                $securityGuard = SecurityGuard::where('email', $user->email)->first();
                if ($securityGuard) {
                    $securityGuardId = $securityGuard->guard_id;
                } else {
                    // Create security guard if doesn't exist
                    try {
                        // Password is required, generate a random one (security guards should set their own password via profile)
                        $tempPassword = \Illuminate\Support\Str::random(16);
                        $securityGuard = $this->securityGuardService->createSecurityGuard([
                            'guard_id' => 'SEC' . str_pad(SecurityGuard::count() + 1, 3, '0', STR_PAD_LEFT),
                            'name' => $user->name ?? 'Security Guard',
                            'email' => $user->email,
                            'phone' => $user->phone ?? null,
                            'password' => $tempPassword, // Required field - will be hashed automatically
                        ]);
                        $securityGuardId = $securityGuard->guard_id;
                    } catch (\Exception $e) {
                        \Log::error('Error creating security guard: ' . $e->getMessage(), [
                            'user_email' => $user->email,
                            'trace' => $e->getTraceAsString()
                        ]);
                        // Ensure default SEC001 exists
                        $defaultGuard = SecurityGuard::find('SEC001');
                        if (!$defaultGuard) {
                            try {
                                $this->securityGuardService->createSecurityGuard([
                                    'guard_id' => 'SEC001',
                                    'name' => 'Default Security Guard',
                                    'email' => 'security@default.local',
                                    'password' => \Illuminate\Support\Str::random(16),
                                ]);
                            } catch (\Exception $e2) {
                                \Log::error('Error creating default security guard: ' . $e2->getMessage());
                            }
                        }
                    }
                }
            } else {
                // No user, ensure default SEC001 exists
                $defaultGuard = SecurityGuard::find('SEC001');
                if (!$defaultGuard) {
                    try {
                        $this->securityGuardService->createSecurityGuard([
                            'guard_id' => 'SEC001',
                            'name' => 'Default Security Guard',
                            'email' => 'security@default.local',
                            'password' => \Illuminate\Support\Str::random(16),
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Error creating default security guard: ' . $e->getMessage());
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error getting/creating security guard: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            // Ensure default SEC001 exists as fallback
            try {
                $defaultGuard = SecurityGuard::find('SEC001');
                if (!$defaultGuard) {
                    $this->securityGuardService->createSecurityGuard([
                        'guard_id' => 'SEC001',
                        'name' => 'Default Security Guard',
                        'email' => 'security@default.local',
                        'password' => \Illuminate\Support\Str::random(16),
                    ]);
                }
            } catch (\Exception $e2) {
                \Log::error('Error creating default security guard fallback: ' . $e2->getMessage());
            }
        }

        // Load course relationship if student exists and not already loaded
        $courseName = 'N/A';
        try {
            if ($student) {
                if (!$student->relationLoaded('course')) {
                    $student->load('course');
                }
                if ($student->course) {
                    $courseName = $student->course->course_name ?? $student->course->course_code ?? 'N/A';
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Error loading course relationship: ' . $e->getMessage());
            // Continue with default 'N/A' if course loading fails
        }

        // Create entry log with success status
        try {
            $entryLog = $this->entryLogService->createEntryLog([
                'qr_code_hash' => $validated['qr_hash'],
                'gate_id' => $gate->gate_id,
                'security_guard_id' => $securityGuardId,
                'status' => 'success',
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error creating entry log: ' . $e->getMessage(), [
                'qr_hash' => $validated['qr_hash'],
                'gate_id' => $gate->gate_id ?? 'N/A',
                'security_guard_id' => $securityGuardId,
                'sql' => $e->getSql() ?? 'N/A',
                'bindings' => $e->getBindings() ?? [],
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'failed',
                'success' => false,
                'valid' => false,
                'message' => 'Database error occurred while logging entry. Please try again.',
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Error creating entry log: ' . $e->getMessage(), [
                'qr_hash' => $validated['qr_hash'],
                'gate_id' => $gate->gate_id ?? 'N/A',
                'security_guard_id' => $securityGuardId,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'failed',
                'success' => false,
                'valid' => false,
                'message' => 'Failed to log entry. Please try again.',
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'valid' => true,
            'message' => 'Device verified successfully',
            'student_data' => $student ? [
                'student_name' => $student->name ?? 'Unknown',
                'student_id' => $student->student_id ?? $student->id ?? 'N/A',
                // 'student_department' => $student->department,
                'student_course' => $courseName,
            ] : null,
            'device' => $device ? [
                'brand' => $device->brand ?? 'Unknown',
                'model' => $device->model ?? 'Unknown',
                'device_type' => 'Laptop', // Per database diagram: system handles laptops only
            ] : null,
            'data' => [
                'name' => $student->name ?? 'Unknown',
                'studentId' => $student->student_id ?? $student->id ?? 'N/A',
                'device' => $device ? ($device->brand . ' ' . $device->model) : 'N/A',
                'expiryDate' => $qrCode->expires_at ? $qrCode->expires_at->setTimezone(config('app.timezone'))->format('Y-m-d') : null,
            ],
        ]);
    }

    /**
     * Deny access and log as denied
     */
    public function denyQR(Request $request)
    {
        try {
            $validated = $request->validate([
                'qr_hash' => 'required|string',
                'gate_name' => 'required|string',
            ]);

            // Find QR code (including those with soft-deleted devices)
            $qrCode = QRCode::where('qr_code_hash', $validated['qr_hash'])
                ->with(['device' => function($query) {
                    $query->withTrashed(); // Include soft-deleted devices
                }])
                ->first();
            
            if (!$qrCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code is not registered in the system. This QR code does not exist in our database.',
                ], 404);
            }

            // Check if QR code is expired - show error, no popup
            if ($qrCode->expires_at && $qrCode->expires_at->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code has expired. Please renew the QR code.',
                ], 400);
            }

            // Check if QR code is inactive
            if (!$qrCode->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code is inactive. This device may have been deactivated.',
                ], 400);
            }

            // Check if device exists
            $device = $qrCode->device;
            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Device not found. This QR code is not associated with any device.',
                ], 404);
            }

            // Check if device is soft-deleted - show error, no popup
            if ($device->trashed() || $device->deleted_at !== null) {
                return response()->json([
                    'success' => false,
                    'message' => 'This device has been deleted. The QR code is no longer valid.',
                ], 400);
            }

            // Note: Rejected devices are allowed - they can still be denied by security
            // Only deleted, not registered, and expired show errors without popup
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid request. Please provide valid QR code hash and gate name.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error denying QR code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing the denial. Please try again.',
            ], 500);
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
        try {
            $entryLog = $this->entryLogService->createEntryLog([
                'qr_code_hash' => $validated['qr_hash'],
                'gate_id' => $gate->gate_id,
                'security_guard_id' => $securityGuardId,
                'status' => 'failed',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating entry log: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to log entry. Please try again.',
            ], 500);
        }

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
        
        if (!$user || (!isset($user->student_id) && !isset($user->id))) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }
        
        $studentId = $user->student_id ?? $user->id;
        $entries = $this->entryLogService->getEntryLogsByStudent($studentId, $limit);
        
        // Relationships are already eager loaded in EntryLogService
        
        $formatted = $entries->map(function ($entry) {
            $device = $entry->qrCode->device ?? null;
            $student = $device->student ?? null;
            
            // Get course name safely
            $courseName = 'N/A';
            if ($student && $student->course) {
                $courseName = $student->course->course_name ?? $student->course->course_code ?? 'N/A';
            }
            
            return [
                'id' => $entry->log_id,
                'gate' => $entry->gate->gate_name ?? 'Unknown Gate',
                'gateLocation' => $entry->gate->location ?? 'N/A',
                'time' => $entry->scan_timestamp 
                    ? $entry->scan_timestamp->setTimezone(config('app.timezone'))->format('M d, Y h:i A') 
                    : 'N/A',
                'date' => $entry->scan_timestamp ? $entry->scan_timestamp->setTimezone(config('app.timezone'))->format('M d, Y') : 'N/A',
                'fullTimestamp' => $entry->scan_timestamp ? $entry->scan_timestamp->setTimezone(config('app.timezone'))->format('M d, Y h:i A') : 'N/A',
                'device' => $device ? ($device->brand . ' ' . $device->model) : 'Unknown Device',
                'deviceType' => 'Laptop', // Per database diagram: system handles laptops only
                'deviceSerial' => $device->serial_number ?? 'N/A',
                'studentName' => $student->name ?? 'Unknown',
                'studentId' => $student->student_id ?? $student->id ?? 'N/A',
                // 'studentDepartment' => $student->department ?? 'N/A',
                'studentCourse' => $courseName,
                'status' => $entry->status, // 'success' for approved, 'failed' for denied
                'accessStatus' => $entry->status === 'success' ? 'approved' : 'denied', // User-friendly status
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
