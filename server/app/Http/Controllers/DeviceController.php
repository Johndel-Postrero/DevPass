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
        // Eager load all relationships to prevent N+1 queries
        // Optimize: Load only active QR codes, latest first
        $query = Device::with([
            'student', 
            'admin', 
            'qrCodes' => function($q) {
                $q->where('is_active', true)->latest('expires_at');
            }
        ]);
        
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
                $query->where('student_id', $user->student_id ?? $user->id); // Support both for backward compatibility
            }
        }
        
        // For students, include rejected and soft-deleted devices when status is 'all' or not specified
        // This ensures devices that have been scanned (even if rejected/deleted) appear in the list
        // IMPORTANT: Always include devices with recent 'reverted' last_action so notifications work
        if (!$isAdmin && (!$status || $status === 'all')) {
            $query->withTrashed(); // Include soft-deleted devices
        }
        
        // --- Status Filtering ---
        if ($status && $status !== 'all') {
            $query->where('registration_status', $status);
            // Note: Devices with 'reverted' last_action have status='active', so they're already included
        } else if (!$isAdmin) {
            // For students with 'all' filter, show all statuses including rejected
            // Don't filter by status, just show everything
            // This ensures devices with 'reverted' last_action are always visible
        }
        
        // Add pagination to prevent loading all devices at once (CRITICAL for performance)
        $perPage = $request->query('per_page', 20); // Default 20 per page, max 100
        $perPage = min(max((int)$perPage, 1), 100); // Enforce limits: 1-100
        
        $devices = $query->orderBy('registration_date', 'desc')->paginate($perPage);
        
        // Get all QR code hashes for batch querying entry logs (optimized with collection methods)
        $qrHashes = $devices->getCollection()->flatMap(function($device) {
            return $device->qrCodes->pluck('qr_code_hash')->filter();
        })->unique()->values()->toArray();
        
        // Batch load entry logs to prevent N+1 queries
        $entryLogs = [];
        if (!empty($qrHashes)) {
            $entries = EntryLog::whereIn('qr_code_hash', $qrHashes)
                ->where('status', 'success')
                ->orderBy('scan_timestamp', 'desc')
                ->get()
                ->groupBy('qr_code_hash');
            
            // Get the latest entry for each QR code
            foreach ($entries as $hash => $logs) {
                $entryLogs[$hash] = $logs->first();
            }
        }
        
        // Format response for frontend
        $formatted = $devices->getCollection()->map(function ($device) use ($entryLogs) {
            // Use the correct primary key name: 'laptop_id'
            $idKey = 'laptop_id';
            
            // Get latest active QR code from eager loaded relationship
            $latestQR = null;
            if ($device->qrCodes && $device->qrCodes->isNotEmpty()) {
                // Filter for active QR codes and get the latest by expires_at
                $activeQRCodes = $device->qrCodes->where('is_active', true);
                if ($activeQRCodes->isNotEmpty()) {
                    $latestQR = $activeQRCodes->sortByDesc('expires_at')->first();
                }
            }
            
            // Get last scanned timestamp from pre-loaded entry logs
            $lastScanned = null;
            if ($latestQR && isset($entryLogs[$latestQR->qr_code_hash])) {
                $lastEntry = $entryLogs[$latestQR->qr_code_hash];
                if ($lastEntry && $lastEntry->scan_timestamp) {
                    $lastScanned = $lastEntry->scan_timestamp->setTimezone(config('app.timezone'))->format('M d, Y h:i A');
                }
            }
            
            // Check if device has pending changes (was previously approved but now pending)
            // A device has pending changes if it's pending but has an approved_at timestamp (was approved before)
            $hasPendingChanges = $device->registration_status === 'pending' && 
                                 $device->approved_at !== null;
            
            return [
                // CHANGED: Primary key is 'laptop_id' in your schema
                'id' => $device->$idKey, 
                'studentName' => $device->student->name ?? 'Unknown',
                'studentId' => $device->student->student_id ?? $device->student->id ?? 'N/A',
                'course' => $device->student->course ?? 'N/A',
                // REMOVED 'type' as it's not in the schema, using 'model'/'brand' instead
                'brand' => $device->brand,
                'model' => $device->model,
                'serialNumber' => $device->serial_number,
                'status' => $device->deleted_at ? 'deleted' : $device->registration_status, // Show 'deleted' if soft-deleted
                'isDeleted' => $device->deleted_at !== null, // Flag to identify deleted devices
                'registrationDate' => $device->registration_date ? $device->registration_date->setTimezone(config('app.timezone'))->format('Y-m-d') : null,
                'qrExpiry' => $latestQR && $latestQR->expires_at ? $latestQR->expires_at->setTimezone(config('app.timezone'))->format('Y-m-d') : null,
                'qrCodeHash' => $latestQR ? $latestQR->qr_code_hash : null,
                'lastScanned' => $lastScanned,
                'hasPendingChanges' => $hasPendingChanges, // Flag to indicate edited device waiting for approval
                'lastAction' => $device->last_action, // Track last action for notifications
                'approvedAt' => $device->approved_at ? $device->approved_at->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s') : null, // Include approved_at for unique notification keys
            ];
        });
        
        // Return paginated response with metadata
        return response()->json([
            'data' => $formatted,
            'current_page' => $devices->currentPage(),
            'per_page' => $devices->perPage(),
            'total' => $devices->total(),
            'last_page' => $devices->lastPage(),
            'from' => $devices->firstItem(),
            'to' => $devices->lastItem(),
        ]);
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
     * Get device approval/rejection history for authenticated student
     */
    public function history(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        // Get all devices for the student, including rejected and deleted ones
        // Use withTrashed() to include soft-deleted devices
        $devices = Device::withTrashed()
            ->with(['admin'])
            ->where('student_id', $user->student_id ?? $user->id)
            ->where(function($query) {
                // Include devices that have been approved, rejected, or deleted
                // A device should appear in history if:
                // 1. It has been approved/rejected (has approved_at), OR
                // 2. It has been deleted (has deleted_at or last_action = 'deleted'), OR
                // 3. It's in active or rejected status
                $query->whereNotNull('approved_at')
                      ->orWhere('registration_status', 'rejected')
                      ->orWhere('registration_status', 'active')
                      ->orWhere('last_action', 'deleted')
                      ->orWhereNotNull('deleted_at');
            })
            ->orderByRaw('CASE WHEN deleted_at IS NOT NULL THEN deleted_at ELSE approved_at END DESC')
            ->orderBy('created_at', 'desc')
            ->limit(50) // Limit to 50 most recent history items for performance
            ->get();
        
        $history = $devices->map(function ($device) {
            $action = 'registered';
            $actionDate = $device->created_at;
            $adminName = null;
            
            // Check if device is deleted
            if ($device->deleted_at || $device->last_action === 'deleted') {
                $action = 'deleted';
                $actionDate = $device->deleted_at ?? $device->updated_at;
                $adminName = 'You'; // Student deleted it themselves
            } elseif ($device->last_action === 'renewal_requested' || $device->last_action === 'renewed') {
                // Handle renewal actions
                if ($device->last_action === 'renewal_requested') {
                    $action = 'renewal_requested';
                    $actionDate = $device->updated_at; // When renewal was requested
                    $adminName = null; // Pending approval
                } else {
                    $action = 'renewed';
                    $actionDate = $device->updated_at; // When renewal was approved
                    $adminName = $device->admin->name ?? 'Admin';
                }
            } elseif ($device->approved_at) {
                // Determine the action and date for approved/rejected devices
                if ($device->registration_status === 'active') {
                    $action = $device->last_action === 'changes_approved' ? 'changes_approved' : 'approved';
                } elseif ($device->registration_status === 'rejected') {
                    $action = $device->last_action === 'reverted' ? 'reverted' : 'rejected';
                }
                $actionDate = $device->approved_at;
                $adminName = $device->admin->name ?? 'Admin';
            }
            
            return [
                'id' => $device->laptop_id,
                'deviceName' => ($device->brand ?? '') . ' ' . ($device->model ?? ''),
                'action' => $action, // 'approved', 'rejected', 'reverted', 'changes_approved', 'registered', 'deleted'
                'actionDate' => $actionDate ? $actionDate->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s') : null,
                'actionDateFormatted' => $actionDate ? $actionDate->setTimezone(config('app.timezone'))->format('M d, Y h:i A') : null,
                'adminName' => $adminName,
                'status' => $device->deleted_at ? 'deleted' : $device->registration_status,
                'registrationDate' => $device->registration_date ? $device->registration_date->setTimezone(config('app.timezone'))->format('Y-m-d') : null,
            ];
        });
        
        return response()->json($history);
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
        
        // Check if this is a renewal request
        $isRenewalRequest = $device->last_action === 'renewal_requested';
        
        if ($isRenewalRequest) {
            // Handle renewal approval
            return $this->approveRenewal($id);
        }
        
        // Check if this is an edited device (has original_values and approved_at)
        $isEditedDevice = $device->original_values !== null && $device->approved_at !== null;
        
        $device->registration_status = 'active';
        $device->approved_by = $adminId;
        $device->approved_at = Carbon::now(config('app.timezone'));
        
        // Clear original values since changes are now approved
        $device->original_values = null;
        $device->last_action = $isEditedDevice ? 'changes_approved' : 'approved';
        $device->save();
        
        // Create QR code for the device (or reactivate existing if it's an edited device)
        if ($isEditedDevice) {
            // For edited devices, reactivate the latest QR code if it exists and is not expired
            $latestQR = $device->qrCodes()->latest('expires_at')->first();
            if ($latestQR && $latestQR->expires_at && $latestQR->expires_at->isFuture()) {
                $latestQR->is_active = true;
                $latestQR->save();
                $qrCode = $latestQR;
            } else {
                // Create new QR code if none exists or all are expired
                $qrCode = $this->qrCodeService->createQRCode([
                    'laptop_id' => $device->laptop_id, 
                    'expires_at' => Carbon::now(config('app.timezone'))->addMonth(),
                    'is_active' => true,
                ]);
            }
        } else {
            // New device - create new QR code
            $qrCode = $this->qrCodeService->createQRCode([
                'laptop_id' => $device->laptop_id, 
                    'expires_at' => Carbon::now(config('app.timezone'))->addMonth(),
                'is_active' => true,
            ]);
        }
        
        return response()->json([
            'message' => 'Device approved successfully',
            'device' => $device->fresh(['student', 'admin']),
            'qr_code' => $qrCode,
            'action' => $isEditedDevice ? 'changes_approved' : 'approved'
        ]);
    }

    /**
     * Reject a device (revert changes if it was an edit, or reject if new registration)
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
        
        // Get admin ID
        $adminId = null;
        if (isset($user->email)) {
            $admin = \App\Models\Admin::where('email', $user->email)->first();
            if ($admin) {
                $adminId = $admin->admin_id;
            }
        }
        
        // Check if this is an edited device (has original_values and approved_at)
        $isEditedDevice = $device->original_values !== null && $device->approved_at !== null;
        
        if ($isEditedDevice) {
            // Revert to original values and reactivate device
            $originalValues = $device->original_values;
            
            $device->update([
                'brand' => $originalValues['brand'] ?? $device->brand,
                'model' => $originalValues['model'] ?? $device->model,
                'serial_number' => $originalValues['serial_number'] ?? $device->serial_number,
                'registration_status' => 'active', // Reactivate device
                'approved_by' => $adminId, // Set the admin who rejected (for tracking)
                'approved_at' => Carbon::now(config('app.timezone')), // Update approval timestamp
                'original_values' => null, // Clear original values
                'last_action' => 'reverted', // Mark as reverted for notification
            ]);
            
            // Reactivate the latest QR code if it exists
            $latestQR = $device->qrCodes()->latest('expires_at')->first();
            if ($latestQR) {
                $latestQR->is_active = true;
                $latestQR->save();
            }
            
            return response()->json([
                'message' => 'Device changes rejected. Original values restored.',
                'device' => $device->fresh(['student', 'admin']),
                'action' => 'reverted'
            ]);
        } else {
            // New device registration - just mark as rejected
            $device->registration_status = 'rejected';
            $device->approved_by = $adminId;
            $device->approved_at = Carbon::now(config('app.timezone'));
            $device->last_action = 'rejected';
            $device->save();
            
            return response()->json([
                'message' => 'Device registration rejected',
                'device' => $device->fresh(['student', 'admin']),
                'action' => 'rejected'
            ]);
        }
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
        
        // Check for duplicate serial number across ALL students (serial numbers must be globally unique)
        if (!empty($validated['serial_number'])) {
            $existingDevice = Device::where('serial_number', $validated['serial_number'])
                ->whereIn('registration_status', ['active', 'pending'])
                ->first();
            
            if ($existingDevice) {
                return response()->json([
                    'message' => 'A device with this serial number already exists. Serial numbers must be unique across all students. Please use a different serial number.',
                    'errors' => [
                        'serial_number' => ['A device with this serial number already exists. Serial numbers must be unique across all students.']
                    ]
                ], 422);
            }
        }
        
        try {
            $device = Device::create([
                'student_id' => $student->student_id ?? $student->id,
                // Removed 'device_type' if it's not in the schema
                'brand' => $validated['brand'] ?? null,
                'model' => $validated['model'], // Model is required - FK to laptop_specifications.model
                'serial_number' => $validated['serial_number'] ?? null,
                // Removed all PC component fields (processor, motherboard, memory, etc.)
                'registration_date' => Carbon::now(config('app.timezone')),
                'registration_status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Device registered successfully',
                'device' => $device
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            // Catch database unique constraint violations
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'Duplicate entry')) {
                // Model duplicates are allowed - ignore model constraint errors
                // Only check for serial number duplicates
                if (str_contains($e->getMessage(), 'serial_number')) {
                    return response()->json([
                        'message' => 'A device with this serial number already exists. Please use a different serial number.',
                        'errors' => [
                            'serial_number' => ['A device with this serial number already exists. Please use a different serial number.']
                        ]
                    ], 422);
                }
                // Model duplicates are allowed - ignore model constraint errors completely
                // If we get a model duplicate error, it means the database constraint still exists
                // We should not block the operation, but log it for debugging
                if (str_contains($e->getMessage(), 'devices_model_unique') || 
                    (str_contains($e->getMessage(), 'model') && str_contains($e->getMessage(), 'Duplicate entry'))) {
                    // Log the error for debugging but don't return an error to user
                    // Model duplicates should be allowed, so this is a database configuration issue
                    \Log::error('Model unique constraint still exists in database despite migration. This should not happen. Error: ' . $e->getMessage());
                    // Return a helpful error message that doesn't mention model duplication
                    // Instead, suggest checking serial number or contact admin
                    return response()->json([
                        'message' => 'Unable to register device. Please ensure the serial number is unique among your active devices, or contact administrator if the issue persists.',
                        'errors' => [
                            'general' => ['Database configuration issue detected. Please contact administrator.']
                        ]
                    ], 500);
                }
            }
            // Re-throw if it's not a duplicate entry error we can handle
            throw $e;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $device = Device::with(['student', 'admin', 'qrCodes', 'specifications'])->findOrFail($id);
        $latestQR = $device->qrCodes()->where('is_active', true)->latest('expires_at')->first();
        
        // Get laptop specifications via relationship (auto-filled when model matches)
        $specs = $device->specifications;
        
        return response()->json([
            'id' => $device->laptop_id,
            'studentName' => $device->student->name ?? 'Unknown',
            'studentId' => $device->student->student_id ?? $device->student->id ?? 'N/A',
            'course' => $device->student->course ?? 'N/A',
            'brand' => $device->brand,
            'model' => $device->model,
            'serialNumber' => $device->serial_number,
            'status' => $device->registration_status,
            'registrationDate' => $device->registration_date ? $device->registration_date->format('Y-m-d') : null,
            'qrExpiry' => $latestQR && $latestQR->expires_at ? $latestQR->expires_at->setTimezone(config('app.timezone'))->format('Y-m-d') : null,
            // Advanced specifications (auto-filled from laptop_specifications when model matches)
            'processor' => $specs->processor ?? null,
            'motherboard' => $specs->motherboard ?? null,
            'memory' => $specs->memory ?? null,
            'harddrive' => $specs->harddrive ?? null,
            'monitor' => $specs->monitor ?? null,
            'casing' => $specs->casing ?? null,
            'cdRom' => $specs->cd_dvd_rom ?? null,
            'operatingSystem' => $specs->operating_system ?? null,
            // 'macAddress' removed - not in database diagram
        ]);
    }

    /**
     * Update the specified device.
     */
    public function update(Request $request, string $id)
    {
        $device = Device::findOrFail($id);
        $user = $request->user();
        
        // Check if user owns the device
        if ($device->student_id !== ($user->student_id ?? $user->id)) {
            return response()->json(['message' => 'Unauthorized. You can only edit your own devices.'], 403);
        }
        
        // Only allow editing active or pending devices
        if (!in_array($device->registration_status, ['active', 'pending'])) {
            return response()->json(['message' => 'You can only edit active or pending devices.'], 400);
        }
        
        $validated = $request->validate([
            'brand' => 'sometimes|required|string|max:50',
            'model' => 'sometimes|required|string|max:100',
            'serial_number' => 'sometimes|required|string|max:100',
            // Advanced specs (optional)
            'processor' => 'sometimes|nullable|string|max:100',
            'motherboard' => 'sometimes|nullable|string|max:100',
            'memory' => 'sometimes|nullable|string|max:50',
            'harddrive' => 'sometimes|nullable|string|max:100',
            'monitor' => 'sometimes|nullable|string|max:100',
            'casing' => 'sometimes|nullable|string|max:100',
            'cd_rom' => 'sometimes|nullable|string|max:100',
            'operating_system' => 'sometimes|nullable|string|max:100',
            // 'mac_address' removed from validation - not in database diagram
        ]);
        
        // Check for duplicate serial number across ALL students (excluding current device)
        // Serial numbers must be globally unique across all students
        if (isset($validated['serial_number']) && !empty($validated['serial_number']) && $validated['serial_number'] !== $device->serial_number) {
            $existingDevice = Device::where('serial_number', $validated['serial_number'])
                ->where('laptop_id', '!=', $device->laptop_id) // Exclude current device
                ->whereIn('registration_status', ['active', 'pending'])
                ->first();
            
            if ($existingDevice) {
                return response()->json([
                    'message' => 'A device with this serial number already exists. Serial numbers must be unique across all students. Please use a different serial number.',
                    'errors' => [
                        'serial_number' => ['A device with this serial number already exists. Serial numbers must be unique across all students.']
                    ]
                ], 422);
            }
        }
        
        // If device was active, store original values before editing
        if ($device->registration_status === 'active') {
            // Store current values as original (for potential rollback on rejection)
            $device->original_values = [
                'brand' => $device->brand,
                'model' => $device->model,
                'serial_number' => $device->serial_number,
            ];
            // Clear any previous last_action since we're making new changes
            $device->last_action = null;
        }
        
        // Update device fields
        try {
            $device->update([
                'brand' => $validated['brand'] ?? $device->brand,
                'model' => $validated['model'] ?? $device->model,
                'serial_number' => $validated['serial_number'] ?? $device->serial_number,
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Catch database unique constraint violations
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'Duplicate entry')) {
                // Check if it's a serial number duplicate (database constraint fallback)
                if (str_contains($e->getMessage(), 'serial_number')) {
                    return response()->json([
                        'message' => 'A device with this serial number already exists. Please use a different serial number.',
                        'errors' => [
                            'serial_number' => ['A device with this serial number already exists. Please use a different serial number.']
                        ]
                    ], 422);
                }
                // Model duplicates are allowed, so we ignore model constraint errors
                // If it's a model duplicate, we'll let it pass (same model/brand is OK)
            }
            // Re-throw if it's not a duplicate entry error we can handle
            throw $e;
        }
        
        // If device was active, change status to pending for re-approval
        if ($device->registration_status === 'active') {
            $device->registration_status = 'pending';
            // Keep approved_at to track that it was previously approved (for hasPendingChanges flag)
            // Only clear approved_by so admin needs to re-approve
            $device->approved_by = null; // Clear previous approval admin
            // Keep approved_at to indicate it was previously approved
            $device->save();
            
            // Deactivate current QR codes since device needs re-approval
            $device->qrCodes()->update(['is_active' => false]);
        }
        
        // TODO: Update laptop_specs table if advanced specs are provided
        // This would require checking if a spec record exists and updating it,
        // or creating a new one if it doesn't exist
        
        return response()->json([
            'message' => 'Device updated successfully. Please wait for admin approval.',
            'device' => $device->fresh(['student', 'admin']),
            'status' => $device->registration_status
        ]);
    }

    /**
     * Remove the specified device.
     */
    public function destroy(Request $request, string $id)
    {
        $device = Device::findOrFail($id);
        $user = $request->user();
        
        // Check if user owns the device
        if ($device->student_id !== ($user->student_id ?? $user->id)) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own devices.'], 403);
        }
        
        // Only allow deleting active devices
        if ($device->registration_status !== 'active') {
            return response()->json(['message' => 'You can only delete active devices.'], 400);
        }
        
        // Mark device as deleted (soft delete) and set last_action
        $device->last_action = 'deleted';
        $device->save();
        
        // Delete associated QR codes
        $device->qrCodes()->delete();
        
        // Soft delete the device (keeps it in database for history)
        $device->delete();
        
        return response()->json([
            'message' => 'Device deleted successfully'
        ]);
    }

    /**
     * Request QR code renewal for a device (requires admin approval)
     */
    public function renewQR(Request $request, string $id)
    {
        $device = Device::with('qrCodes')->findOrFail($id);
        $user = $request->user();
        
        // Check if user owns the device
        if ($device->student_id !== ($user->student_id ?? $user->id)) {
            return response()->json(['message' => 'Unauthorized. You can only renew QR codes for your own devices.'], 403);
        }
        
        // Only allow renewing for active devices
        if ($device->registration_status !== 'active') {
            return response()->json(['message' => 'You can only renew QR codes for active devices.'], 400);
        }
        
        // Get the latest QR code (active or expired)
        $latestQR = $device->qrCodes()->latest('expires_at')->first();
        
        // Check if QR code exists
        if (!$latestQR) {
            return response()->json(['message' => 'No QR code found for this device.'], 404);
        }
        
        // Check if QR code is expired (only allow renewal for expired QR codes)
        if ($latestQR->expires_at && $latestQR->expires_at->isFuture()) {
            return response()->json([
                'message' => 'QR code is still valid. You can only renew expired QR codes.',
                'expires_at' => $latestQR->expires_at->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s')
            ], 400);
        }
        
        // Check if there's already a pending renewal request
        if ($device->last_action === 'renewal_requested') {
            return response()->json([
                'message' => 'A renewal request is already pending approval. Please wait for admin approval.',
            ], 400);
        }
        
        // Mark renewal as requested (requires admin approval)
        $device->last_action = 'renewal_requested';
        $device->save();
        
        return response()->json([
            'message' => 'Renewal request submitted successfully. Please wait for admin approval.',
            'device' => $device->fresh(['student', 'admin'])
        ]);
    }

    /**
     * Approve QR code renewal (admin only)
     */
    public function approveRenewal($id)
    {
        $device = Device::with('qrCodes')->findOrFail($id);
        $user = Auth::user();
        
        // Get admin ID
        $adminId = null;
        if (isset($user->email)) {
            $admin = \App\Models\Admin::where('email', $user->email)->first();
            if ($admin) {
                $adminId = $admin->admin_id;
            }
        }
        
        // Check if there's a pending renewal request
        if ($device->last_action !== 'renewal_requested') {
            return response()->json([
                'message' => 'No pending renewal request for this device.',
            ], 400);
        }
        
        // Get the latest QR code
        $latestQR = $device->qrCodes()->latest('expires_at')->first();
        
        // Deactivate old QR code if it exists
        if ($latestQR && $latestQR->is_active) {
            $latestQR->is_active = false;
            $latestQR->save();
        }
        
        // Create new QR code
        $newQRCode = $this->qrCodeService->createQRCode([
            'laptop_id' => $device->laptop_id,
            'expires_at' => Carbon::now(config('app.timezone'))->addMonth(),
            'is_active' => true,
        ]);
        
        // Update device to mark renewal as approved
        $device->last_action = 'renewed';
        $device->approved_by = $adminId;
        $device->approved_at = Carbon::now();
        $device->save();
        
        return response()->json([
            'message' => 'QR code renewal approved successfully',
            'qr_code' => $newQRCode,
            'device' => $device->fresh(['student', 'admin'])
        ]);
    }

    /**
     * Reject QR code renewal (admin only)
     */
    public function rejectRenewal($id)
    {
        $device = Device::findOrFail($id);
        
        // Check if there's a pending renewal request
        if ($device->last_action !== 'renewal_requested') {
            return response()->json([
                'message' => 'No pending renewal request for this device.',
            ], 400);
        }
        
        // Clear the renewal request
        $device->last_action = null;
        $device->save();
        
        return response()->json([
            'message' => 'QR code renewal rejected',
            'device' => $device->fresh(['student', 'admin'])
        ]);
    }
}