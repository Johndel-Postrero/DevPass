<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new student
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|min:8|max:8|unique:students,id',
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:students,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:15',
            // 'department_id' => 'nullable|string|max:50',
            'course_id' => 'nullable|string|exists:course,course_id',
            'year_of_study' => 'nullable|integer',
        ]);

        $result = $this->authService->register($validated);

        return response()->json([
            'message' => 'Registration successful',
            'student' => $result['student'],
            'token' => $result['token']
        ], 201);
    }

    /**
     * Login student
     */
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'id' => 'required|string',
                'password' => 'required|string',
            ]);

            $result = $this->authService->login($credentials);

            return response()->json([
                'message' => 'Login successful',
                'student' => $result['student'],
                'token' => $result['token'],
                'user_type' => $result['user_type'] ?? 'student'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Login failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred during login. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Logout user (student or security guard)
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        // Delete all tokens for the authenticated user
        $user->tokens()->delete();
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated user profile (student or security guard)
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        // Check if user is a security guard or student
        if ($user instanceof \App\Models\SecurityGuard) {
            // Return security guard profile wrapped in 'student' key for backward compatibility
            return response()->json([
                'student' => $user
            ]);
        }
        
        // Otherwise, treat as student
        $student = $this->authService->getProfile($user);
        // Return student wrapped in 'student' key for consistency with security guard response
        return response()->json([
            'student' => $student
        ]);
    }

    /**
     * Update authenticated user profile (student or security guard)
     */
    public function updateProfile(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|nullable|string|max:20',
            ]);

            $user = $request->user();
            
            // Check if user is a security guard
            if ($user instanceof \App\Models\SecurityGuard) {
                // Update security guard profile
                $user->update($validated);
                return response()->json([
                    'message' => 'Profile updated successfully',
                    'student' => $user // Using 'student' key for backward compatibility
                ]);
            }
            
            // Otherwise, treat as student
            $studentService = app(\App\Services\StudentService::class);
            $updatedStudent = $studentService->updateProfile($user->id, $validated);
            
            if (!$updatedStudent) {
                return response()->json([
                    'message' => 'Student not found'
                ], 404);
            }

            return response()->json([
                'message' => 'Profile updated successfully',
                'student' => $updatedStudent
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Update profile error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating profile.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}