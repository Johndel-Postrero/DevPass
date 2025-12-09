<?php

namespace App\Services;

use App\Models\SecurityGuard;
use Illuminate\Support\Facades\Hash;

class SecurityGuardService
{
    public function getAllSecurityGuards()
    {
        return SecurityGuard::all();
    }

    public function getSecurityGuardById($id)
    {
        return SecurityGuard::findOrFail($id);
    }

    public function createSecurityGuard(array $data)
    {
        // Password will be automatically hashed by the model's setPasswordAttribute mutator
        return SecurityGuard::create($data);
    }

    public function updateSecurityGuard($id, array $data)
    {
        $guard = SecurityGuard::findOrFail($id);
        
        // Hash password if provided
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            // Remove password from update data if not provided
            unset($data['password']);
        }
        
        $guard->update($data);
        return $guard;
    }

    public function deleteSecurityGuard($id)
    {
        $guard = SecurityGuard::findOrFail($id);
        
        // Delete all tokens for this security guard (logout from all devices)
        // This ensures that if the guard is currently logged in, they will be automatically logged out
        $guard->tokens()->delete();
        
        // Delete the security guard
        $guard->delete();
        return true;
    }
}

