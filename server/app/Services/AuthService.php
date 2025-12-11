<?php

namespace App\Services;

use App\Models\Student;
use App\Models\SecurityGuard;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new student
     */
    public function register(array $data)
    {
        // Check which column exists in students table for backward compatibility
        $hasStudentId = \Illuminate\Support\Facades\Schema::hasColumn('students', 'student_id');
        
        // Prepare student data based on actual database structure
        $studentData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'course_id' => isset($data['course_id']) ? (int) $data['course_id'] : null, // Integer per database diagram
            'year_of_study' => $data['year_of_study'] ?? null,
            'password' => $data['password'], // Will be auto-hashed by model
        ];
        
        // Use the correct column name based on database structure
        if ($hasStudentId) {
            $studentData['student_id'] = $data['id'] ?? $data['student_id'];
        } else {
            $studentData['id'] = $data['id'] ?? $data['student_id'];
        }
        
        $student = Student::create($studentData);

        // Create authentication token
        $token = $student->createToken('auth-token')->plainTextToken;

        return [
            'student' => $student,
            'token' => $token
        ];
    }

    /**
     * Login a student or security guard
     */
    public function login(array $credentials)
    {
        // Normalize the ID to uppercase for case-insensitive comparison
        $normalizedId = strtoupper(trim($credentials['id']));
        
        // Try to find admin first (by username or email) - admins use username for login
        $admin = Admin::where(function($query) use ($normalizedId, $credentials) {
            $query->whereRaw('UPPER(username) = ?', [$normalizedId])
                  ->orWhereRaw('UPPER(email) = ?', [strtoupper(trim($credentials['id']))]);
        })->first();
        
        if ($admin) {
            // Check if password is correct
            if (!Hash::check($credentials['password'], $admin->password)) {
                throw ValidationException::withMessages([
                    'id' => ['The provided credentials are incorrect.'],
                ]);
            }

            // Create new token
            try {
                $token = $admin->createToken('auth-token')->plainTextToken;
            } catch (\Exception $e) {
                \Log::error('Token creation failed for admin: ' . $e->getMessage());
                throw ValidationException::withMessages([
                    'id' => ['An error occurred during authentication. Please try again.'],
                ]);
            }

            return [
                'student' => $admin, // Using 'student' key for backward compatibility with frontend
                'token' => $token,
                'user_type' => 'admin'
            ];
        }
        
        // Try to find student (case-insensitive) - check both id and student_id for backward compatibility
        $hasStudentId = \Illuminate\Support\Facades\Schema::hasColumn('students', 'student_id');
        
        if ($hasStudentId) {
            $student = Student::whereRaw('UPPER(student_id) = ?', [$normalizedId])->first();
        } else {
            $student = Student::whereRaw('UPPER(id) = ?', [$normalizedId])->first();
        }
        
        if ($student) {
            // Check if password is correct
            if (!Hash::check($credentials['password'], $student->password)) {
                throw ValidationException::withMessages([
                    'id' => ['The provided credentials are incorrect.'],
                ]);
            }

            // Create new token
            $token = $student->createToken('auth-token')->plainTextToken;

            return [
                'student' => $student,
                'token' => $token,
                'user_type' => 'student'
            ];
        }

        // If not a student, try to find security guard (case-insensitive)
        $guard = SecurityGuard::whereRaw('UPPER(guard_id) = ?', [$normalizedId])->first();
        
        if ($guard) {
            // Check if guard has a password set
            if (empty($guard->password)) {
                throw ValidationException::withMessages([
                    'id' => ['Password not set for this account. Please contact administrator.'],
                ]);
            }

            // Check if password is correct
            if (!Hash::check($credentials['password'], $guard->password)) {
                throw ValidationException::withMessages([
                    'id' => ['The provided credentials are incorrect.'],
                ]);
            }

            // Create new token
            try {
                $token = $guard->createToken('auth-token')->plainTextToken;
            } catch (\Exception $e) {
                \Log::error('Token creation failed for security guard: ' . $e->getMessage());
                throw ValidationException::withMessages([
                    'id' => ['An error occurred during authentication. Please try again.'],
                ]);
            }

            return [
                'student' => $guard, // Using 'student' key for backward compatibility
                'token' => $token,
                'user_type' => 'security'
            ];
        }

        // If neither admin, student nor guard found
        throw ValidationException::withMessages([
            'id' => ['The provided credentials are incorrect.'],
        ]);
    }

    /**
     * Logout a student
     */
    public function logout(Student $student)
    {
        // Delete all tokens (logout from all devices)
        $student->tokens()->delete();

        // Or delete only current token:
        // $student->currentAccessToken()->delete();

        return ['message' => 'Logged out successfully'];
    }

    /**
     * Get authenticated student profile
     */
    public function getProfile(Student $student)
    {
        return $student;
    }

}