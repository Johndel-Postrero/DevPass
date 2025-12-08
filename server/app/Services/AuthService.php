<?php

namespace App\Services;

use App\Models\Student;
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
        $student = Student::create([
            'id' => $data['id'],
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            // 'department_id' => $data['department_id'] ?? null,
            'course_id' => $data['course_id'] ?? null,
            'year_of_study' => $data['year_of_study'] ?? null,
            'password' => $data['password'], // Will be auto-hashed by model
        ]);

        // Create authentication token
        $token = $student->createToken('auth-token')->plainTextToken;

        return [
            'student' => $student,
            'token' => $token
        ];
    }

    /**
     * Login a student
     */
    public function login(array $credentials)
    {
        // Find student by id
        $student = Student::where('id', $credentials['id'])->first();

        // Check if student exists
        if (!$student) {
            throw ValidationException::withMessages([
                'id' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Debug: Log password check (remove in production)
        \Log::info('Login attempt', [
            'student_id' => $student->id,
            'password_provided' => !empty($credentials['password']),
            'password_hash_exists' => !empty($student->password),
            'hash_check' => Hash::check($credentials['password'], $student->password)
        ]);

        // Check if password is correct
        if (!Hash::check($credentials['password'], $student->password)) {
            throw ValidationException::withMessages([
                'id' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Delete old tokens (optional - for single device login)
        // $student->tokens()->delete();

        // Create new token
        $token = $student->createToken('auth-token')->plainTextToken;

        return [
            'student' => $student,
            'token' => $token
        ];
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

    /**
     * Request password reset code
     */
    public function requestPasswordReset(string $email)
    {
        $student = Student::where('email', $email)->first();

        if (!$student) {
            throw ValidationException::withMessages([
                'email' => ['The provided email is not registered.'],
            ]);
        }

        // Invalidate old codes for this email
        \App\Models\PasswordResetCode::where('email', $email)
            ->where('used', false)
            ->update(['used' => true]);

        // Generate new 6-digit code
        $code = \App\Models\PasswordResetCode::generateCode();

        // Create reset code record (expires in 15 minutes)
        $resetCode = \App\Models\PasswordResetCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
            'used' => false,
        ]);

        // Send email with code
        try {
            \Mail::to($email)->send(new \App\Mail\PasswordResetCode($code, $student->name));
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Failed to send password reset email', [
                'email' => $email,
                'error' => $e->getMessage(),
                'mailer' => config('mail.default')
            ]);
            
            // If using SMTP and it fails, provide helpful error message
            if (config('mail.default') === 'smtp') {
                throw ValidationException::withMessages([
                    'email' => [
                        'Failed to send email. Please check your mail configuration. ' .
                        'For development, set MAIL_MAILER=log in your .env file. ' .
                        'Error: ' . $e->getMessage()
                    ],
                ]);
            }
            
            // Re-throw for other mailers
            throw $e;
        }

        // Log success (especially useful when using 'log' driver)
        \Log::info('Password reset code sent', [
            'email' => $email,
            'code' => $code,
            'mailer' => config('mail.default')
        ]);

        return ['message' => 'Password reset code sent to your email'];
    }

    /**
     * Reset password with code
     */
    public function resetPassword(array $data)
    {
        $student = Student::where('email', $data['email'])->first();

        if (!$student) {
            throw ValidationException::withMessages([
                'email' => ['The provided email is not registered.'],
            ]);
        }

        // Find valid reset code
        $resetCode = \App\Models\PasswordResetCode::where('email', $data['email'])
            ->where('code', $data['code'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$resetCode) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired reset code.'],
            ]);
        }

        // Update password
        $student->password = $data['password'];
        $student->save();

        // Mark code as used
        $resetCode->markAsUsed();

        return ['message' => 'Password reset successful'];
    }

    
}