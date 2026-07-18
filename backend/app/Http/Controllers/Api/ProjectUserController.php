<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;

class ProjectUserController extends Controller
{
    public function index(Project $project)
    {
        return response()->json(
            $project->users
        );
    }


    public function store(Project $project, User $user)
    {
        $project->users()->syncWithoutDetaching([
            $user->id
        ]);

        return response()->json([
            'message' => 'User assigned to project'
        ]);
    }


    public function destroy(Project $project, User $user)
    {
        $project->users()->detach($user->id);

        return response()->json([
            'message' => 'User removed from project'
        ]);
    }
}
