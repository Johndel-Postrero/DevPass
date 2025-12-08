<?php

namespace App\Services;

use App\Models\Laptop;
use App\Models\Student;
use Illuminate\Http\Request;

class LaptopService
{
    /**
     * Get all laptops (optionally filtered)
     */
    /**
     * Get all laptops (optionally filtered)
     */
    public function getAllLaptops($filters = [])
    {
        $query = Laptop::with(['student.course', 'approver']);

        // ... (Your existing filter logic stays exactly the same) ...
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'active') {
                $query->where('registration_status', 'approved');
            } elseif ($filters['status'] === 'pending') {
                $query->where('registration_status', 'pending');
            } else {
                $query->where('registration_status', $filters['status']);
            }
        }

        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        $laptops = $query->orderBy('registration_date', 'desc')->get();

        return $laptops->map(function ($laptop) {
            return [
                'id' => $laptop->laptop_id,

                'qr_code_hash' => $laptop->activeQrCode ? $laptop->activeQrCode->qr_code_hash : null,
    
                'activeQrCode' => $laptop->activeQrCode ?? null, // You can keep this too
                
                // ✅ FIX 1: Add camelCase ID for frontend
                'studentId' => $laptop->student_id, 
                'student_id' => $laptop->student_id, 

                // ✅ FIX 2: Create the studentName string explicitly
                // This combines First + Last name so the frontend doesn't have to guess
                'studentName' => $laptop->student ? ($laptop->student->first_name . ' ' . $laptop->student->last_name) : 'Unknown Student',

                'brand' => $laptop->brand,
                'model' => $laptop->model,
                'serial_number' => $laptop->serial_number,
                'serialNumber' => $laptop->serial_number,
                'type' => 'Laptop',
                
                'status' => $laptop->registration_status === 'approved' ? 'active' : $laptop->registration_status,
                'registration_status' => $laptop->registration_status,
                'approval_status' => $laptop->registration_status,
                
                'registrationDate' => $laptop->registration_date ? 
                    date('M d, Y', strtotime($laptop->registration_date)) : null,
                'qrExpiry' => $laptop->qr_expiry ? 
                    date('M d, Y', strtotime($laptop->qr_expiry)) : 'N/A',
                'lastScanned' => $laptop->last_scanned_at ? 
                    date('M d, Y h:i A', strtotime($laptop->last_scanned_at)) : null,
                
                'created_at' => $laptop->created_at,
                'updated_at' => $laptop->updated_at,
                'registration_date' => $laptop->registration_date,
                
                'student' => $laptop->student,
                // Ensure course is accessible directly if needed
                'course' => $laptop->student->course ?? null, 
                'approver' => $laptop->approver,
                'activeQrCode' => $laptop->activeQrCode ?? null,

                
            ];
        });
    }

    /**
     * Get laptop by ID
     */
    public function getLaptopById($laptopId)
    {
        return Laptop::with(['student', 'approver', 'activeQrCode'])
            ->findOrFail($laptopId);
    }

    /**
     * Get laptops by student
     */
    /**
     * Get laptops by student
     */
    public function getLaptopsByStudent($studentId)
    {
        $laptops = Laptop::with(['student.course', 'approver', 'activeQrCode'])
            ->where('student_id', $studentId)
            ->orderBy('registration_date', 'desc')
            ->get();

        // ✅ MAP DATA FOR FRONTEND COMPATIBILITY
        return $laptops->map(function ($laptop) {
            return [
                'id' => $laptop->laptop_id,
                'studentId' => $laptop->student_id, 
                'student_id' => $laptop->student_id, // Keep snake_case for consistency if needed elsewhere

                'qr_code_hash' => $laptop->activeQrCode ? $laptop->activeQrCode->qr_code_hash : null,
    
                'activeQrCode' => $laptop->activeQrCode ?? null, // You can keep this too

                'studentName' => $laptop->student ? ($laptop->student->first_name . ' ' . $laptop->student->last_name) : 'Unknown Student',

                'brand' => $laptop->brand,
                'model' => $laptop->model,
                'serial_number' => $laptop->serial_number,
                'serialNumber' => $laptop->serial_number,
                'type' => 'Laptop',
                
                // ✅ Map registration_status to status
                'status' => $laptop->registration_status === 'approved' ? 'active' : $laptop->registration_status,
                'registration_status' => $laptop->registration_status,
                'approval_status' => $laptop->registration_status,
                
                'registrationDate' => $laptop->registration_date ? 
                    date('M d, Y', strtotime($laptop->registration_date)) : null,
                'qrExpiry' => $laptop->qr_expiry ? 
                    date('M d, Y', strtotime($laptop->qr_expiry)) : 'N/A',
                'lastScanned' => $laptop->last_scanned_at ? 
                    date('M d, Y h:i A', strtotime($laptop->last_scanned_at)) : null,
                
                'created_at' => $laptop->created_at,
                'updated_at' => $laptop->updated_at,
                'registration_date' => $laptop->registration_date,
                'registered_date' => $laptop->registration_date,
                
                'student' => $laptop->student,
                'course' => $laptop->student ? $laptop->student->course : null,
                'approver' => $laptop->approver,
                // 'activeQrCode' => $laptop->activeQrCode ?? null,
            ];
        });
    }

    /**
     * Register a new laptop
     */
    public function registerLaptop(array $data)
    {
        // Verify student exists
        $student = Student::findOrFail($data['student_id']);

        // Create laptop
        $laptop = Laptop::create([
            'student_id' => $data['student_id'],
            'model' => $data['model'],
            'serial_number' => $data['serial_number'],
            'brand' => $data['brand'],
            'registration_date' => now(),
            'registration_status' => 'pending',
        ]);

        return $laptop->load('student');
    }

    /**
     * Update laptop details
     */
    public function updateLaptop($laptopId, array $data)
    {
        $laptop = Laptop::findOrFail($laptopId);

        // Only allow updates if pending
        if ($laptop->registration_status !== 'pending') {
            throw new \Exception('Cannot update laptop after approval/rejection');
        }

        $laptop->update($data);

        return $laptop->load('student');
    }

    /**
     * Approve laptop registration
     */
    public function approveLaptop($laptopId, $adminId)
    {
        $laptop = Laptop::findOrFail($laptopId);

        // Standard approval logic
        $laptop->registration_status = 'approved';
        $laptop->approved_by = $adminId; // This now links to a REAL admin ID (1)
        $laptop->approved_at = now();
        $laptop->save();

        // Generate QR Code
        if (!$laptop->activeQrCode) {
            \App\Models\QRCode::create([
                'laptop_id' => $laptop->laptop_id,
                'qr_code_hash' => hash('sha256', \Illuminate\Support\Str::random(40) . time()),
                'generated_at' => now(),
                'expires_at' => now()->addDays(365), // 1 Year validity
                'is_active' => true
            ]);
        }

        return $laptop->fresh()->load(['student', 'approver', 'activeQrCode']);
    }

    /**
     * Reject laptop registration
     */
    public function rejectLaptop($laptopId, $adminId)
    {
        $laptop = Laptop::findOrFail($laptopId);

        if ($laptop->registration_status !== 'pending') {
            throw new \Exception('Laptop is not pending approval');
        }

        $laptop->reject($adminId);

        return $laptop->load(['student', 'approver']);
    }

    /**
     * Delete laptop
     */
    public function deleteLaptop($laptopId)
    {
        $laptop = Laptop::findOrFail($laptopId);

        // Only allow deletion if pending
        if ($laptop->registration_status !== 'pending') {
            throw new \Exception('Cannot delete approved/rejected laptop');
        }

        $laptop->delete();

        return true;
    }

    /**
     * Get pending laptops (for admin review)
     */
    public function getPendingLaptops()
    {
        return Laptop::pending()
            ->with('student')
            ->orderBy('registration_date', 'asc')
            ->get();
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'DEBUG_ROLE_CHECK' => 'FAILED',
                'YOUR_ACTUAL_ROLE_IS' => $user->role, // <--- This is what we need to see
                'user_id' => $user->id
            ]);
        }   

        // If admin, show all stats
        if (strtolower($user->role) === 'admin' || $user->role === 1) {
            $total = Laptop::count();
            $pending = Laptop::where('approval_status', 'pending')->count();
            $active = Laptop::where('approval_status', 'approved')->count();
            $rejected = Laptop::where('approval_status', 'rejected')->count();
        } else {
            // If student, show only their stats
            $total = Laptop::where('student_id', $user->id)->count();
            $pending = Laptop::where('student_id', $user->id)
                ->where('approval_status', 'pending')->count();
            $active = Laptop::where('student_id', $user->id)
                ->where('approval_status', 'approved')->count();
            $rejected = Laptop::where('student_id', $user->id)
                ->where('approval_status', 'rejected')->count();
        }
        
        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'active' => $active,
            'rejected' => $rejected
        ]);
    }

    /**
     * Get laptop statistics
     */
    public function getStats($user)
{
    // Check if the user is an instance of the Admin model
    // This is the PROPER way to check roles now
    if ($user instanceof \App\Models\Admin) {
        $total = Laptop::count();
        $pending = Laptop::where('registration_status', 'pending')->count();
        $active = Laptop::where('registration_status', 'approved')->count();
        $rejected = Laptop::where('registration_status', 'rejected')->count();
    } else {
        $total = Laptop::where('student_id', $user->id)->count();
        $pending = Laptop::where('student_id', $user->id)->where('registration_status', 'pending')->count();
        $active = Laptop::where('student_id', $user->id)->where('registration_status', 'approved')->count();
        $rejected = Laptop::where('student_id', $user->id)->where('registration_status', 'rejected')->count();
    }
    
    return [
        'total' => $total,
        'pending' => $pending,
        'active' => $active,
        'rejected' => $rejected
    ];
}
}