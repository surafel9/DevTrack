<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
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
        $project->members()->detach($userId);


        return response()->json([
            'message' => 'Member removed successfully.'
        ]);
    }
}
