<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $currentUser = auth()->user();
        
        $users = User::with([
            'projects' => function ($query) use ($currentUser) {
                if (!$currentUser->isCompanyAdmin()) {
                    $query->whereHas('members', function ($q) use ($currentUser) {
                        $q->where('users.id', $currentUser->id);
                    });
                }
            },
            'permissions:id,name'
        ])->get();

        // Map data to match frontend requirements
        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'projects' => $user->projects,
                'permissions' => $user->permissions->pluck('name'),
            ];
        });

        return response()->json($formattedUsers);
    }

    public function updatePermissions(Request $request, User $user): JsonResponse
    {
        // Only admins can update permissions
        if (!auth()->user()->isCompanyAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'permissions' => 'present|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Find permission IDs
        $permissionIds = Permission::whereIn('name', $validated['permissions'])->pluck('id');

        // Sync permissions
        $user->permissions()->sync($permissionIds);

        return response()->json([
            'message' => 'Permissions updated successfully',
            'permissions' => $user->permissions()->pluck('name')
        ]);
    }
}
