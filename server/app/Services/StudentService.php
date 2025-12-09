<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Device;
use Laravel\Sanctum\PersonalAccessToken;

class StudentService
{
    public function getAllStudents()
    {
        // Optimize: Use subqueries to get device counts in a single query instead of N+1 queries
        $students = Student::with(['course'])
            ->withCount([
                'devices as active_devices_count' => function ($query) {
                    $query->where('registration_status', 'active');
                },
                'devices as pending_devices_count' => function ($query) {
                    $query->whereIn('registration_status', ['pending', 'pending_renewal']);
                },
                'devices as rejected_devices_count' => function ($query) {
                    $query->where('registration_status', 'rejected');
                }
            ])
            ->get();
        
        // Optimize: Fetch all active tokens in a single query
        $studentIds = $students->pluck('id')->toArray();
        $activeTokenStudentIds = PersonalAccessToken::where('tokenable_type', Student::class)
            ->whereIn('tokenable_id', $studentIds)
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->pluck('tokenable_id')
            ->unique()
            ->toArray();
        
        // Add device counts and login status for each student
        return $students->map(function ($student) use ($activeTokenStudentIds) {
            // Check if student has active tokens (from pre-fetched list)
            $hasActiveTokens = in_array($student->id, $activeTokenStudentIds);
            
            // Determine student status based on login status
            // If logged in: active, if logged out: inactive
            $status = $hasActiveTokens ? 'active' : 'inactive';
            
            // Add device counts and status to student object
            // devices_count should only include active devices (exclude rejected)
            $student->devices_count = $student->active_devices_count ?? 0;
            $student->active_devices_count = $student->active_devices_count ?? 0;
            $student->pending_devices_count = $student->pending_devices_count ?? 0;
            $student->rejected_devices_count = $student->rejected_devices_count ?? 0;
            $student->status = $status;
            $student->is_logged_in = $hasActiveTokens;
            
            return $student;
        });
    }

    public function getStudentById($id)
    {
        return Student::find($id);
    }

    public function addStudent($data)
    {
        return Student::create($data);
    }

    public function updateStudent($id, $data)
    {
        $student = Student::find($id);
        if(!$student) return null;

        $student->update($data);
        return $student;
    }

    public function deleteStudent($id)
    {
        $student = Student::find($id);
        if(!$student) return false;

        $student->delete();
        return true;
    }

    /**
     * Update the authenticated student's profile
     */
    public function updateProfile($studentId, array $data)
    {
        $student = Student::find($studentId);
        if (!$student) {
            return null;
        }

        // Only allow updating specific fields
        $allowedFields = ['name', 'phone'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));
        
        $student->update($updateData);
        return $student->fresh();
    }
}