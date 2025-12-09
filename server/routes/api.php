<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DeviceEntryController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\QRCodeController;
use App\Http\Controllers\SecurityGuardController;
use App\Http\Controllers\GateController;

// Public routes (no authentication required)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    
    // Your existing routes
    Route::apiResource('students', StudentController::class);
    
    // Device routes
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::get('/devices/stats', [DeviceController::class, 'stats']);
    Route::get('/devices/history', [DeviceController::class, 'history']); // Device approval/rejection history
    Route::post('/devices', [DeviceController::class, 'store']);
    Route::get('/devices/{id}', [DeviceController::class, 'show']);
    Route::put('/devices/{id}', [DeviceController::class, 'update']);
    Route::delete('/devices/{id}', [DeviceController::class, 'destroy']);
    Route::post('/devices/{id}/approve', [DeviceController::class, 'approve']);
    Route::post('/devices/{id}/reject', [DeviceController::class, 'reject']);
    Route::post('/devices/{id}/renew-qr', [DeviceController::class, 'renewQR']);
    
    // Device entry routes (scans)
    Route::get('/entries', [DeviceEntryController::class, 'index']);
    Route::get('/entries/stats', [DeviceEntryController::class, 'stats']);
    Route::get('/entries/student-activity', [DeviceEntryController::class, 'studentActivity']); // Student's own activity
    Route::post('/entries/read-qr', [DeviceEntryController::class, 'readQR']); // Read without logging
    Route::post('/entries/validate-qr', [DeviceEntryController::class, 'validateQR']); // Accept and log
    Route::post('/entries/deny-qr', [DeviceEntryController::class, 'denyQR']); // Deny and log
    Route::post('/entries', [DeviceEntryController::class, 'store']);
    
    // Admin routes
    Route::apiResource('admins', AdminController::class);
    
    // QR Code routes
    Route::apiResource('qr-codes', QRCodeController::class);
    
    // Security Guard routes
    Route::apiResource('security-guards', SecurityGuardController::class);
    
    // Gate routes
    Route::apiResource('gates', GateController::class);
});