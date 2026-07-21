<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    public function index(Project $project)
    {
        return response()->json([
            'members' => $project->members
        ]);
    }


    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'user_id' => [
                'required',
                'exists:users,id'
            ],
        ]);


        if ($project->members()
            ->where('user_id', $validated['user_id'])
            ->exists()
        ) {

            return response()->json([
                'message' => 'User is already a member.'
            ], 409);
        }


        $project->members()->attach(
            $validated['user_id']
        );


        return response()->json([
            'message' => 'Member added successfully.'
        ]);
    }


    public function destroy(Project $project, $userId)
    {
        if ($project->created_by == $userId) {
            return response()->json([
                'message' => 'Cannot remove the project creator.'
            ], 403);
        }

        $user = User::find($userId);
        if ($user && $user->isCompanyAdmin()) {
            return response()->json([
                'message' => 'Cannot remove a company admin.'
            ], 403);
        }

        if (!$project->members()->where('user_id', $userId)->exists()) {
            return response()->json([
                'message' => 'User is not a member of this project.'
            ], 404);
        }

        $project->members()->detach($userId);


        return response()->json([
            'message' => 'Member removed successfully.'
        ]);
    }
}
