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
            'course_id' => 'nullable|string|max:100',
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
     * Request password reset code
     */
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:students,email',
        ]);

        $result = $this->authService->requestPasswordReset($validated['email']);

        return response()->json([
            'message' => 'Password reset code sent to your email',
        ]);
    }

    /**
     * Reset password with code
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:students,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $result = $this->authService->resetPassword($validated);

        return response()->json([
            'message' => 'Password reset successful',
        ]);
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
                'token' => $result['token']
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
     * Logout student
     */
    public function logout(Request $request)
    {
        $result = $this->authService->logout($request->user());

        return response()->json($result);
    }

    /**
     * Get authenticated student profile
     */
    public function profile(Request $request)
    {
        $student = $this->authService->getProfile($request->user());

        return response()->json($student);
    }
}