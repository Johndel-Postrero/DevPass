<?php

namespace App\Http\Controllers;

use App\Services\SecurityGuardService;
use Illuminate\Http\Request;

class SecurityGuardController extends Controller
{
    protected $securityGuardService;

    public function __construct(SecurityGuardService $securityGuardService)
    {
        $this->securityGuardService = $securityGuardService;
    }

    public function index()
    {
        $guards = $this->securityGuardService->getAllSecurityGuards();
        return response()->json($guards);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guard_id' => 'required|string|max:20|unique:security_guards,guard_id',
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:158',
            'phone' => 'nullable|string|max:15',
            'password' => 'required|string|min:6',
        ]);

        $guard = $this->securityGuardService->createSecurityGuard($validated);
        return response()->json($guard, 201);
    }

    public function show($id)
    {
        $guard = $this->securityGuardService->getSecurityGuardById($id);
        return response()->json($guard);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|nullable|email|max:158',
            'phone' => 'sometimes|nullable|string|max:15',
            'password' => 'sometimes|string|min:6',
        ]);

        $guard = $this->securityGuardService->updateSecurityGuard($id, $validated);
        return response()->json($guard);
    }

    public function destroy($id)
    {
        $this->securityGuardService->deleteSecurityGuard($id);
        return response()->json(['message' => 'Security Guard deleted successfully']);
    }
}
