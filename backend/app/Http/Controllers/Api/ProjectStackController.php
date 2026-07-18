<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Stack;

class ProjectStackController extends Controller
{
    public function index(Project $project)
    {
        return response()->json(
            $project->stacks
        );
    }


    public function store(Project $project, Stack $stack)
    {

        $project->stacks()
            ->syncWithoutDetaching([
                $stack->id
            ]);


        return response()->json([
            'message' => 'Stack added to project'
        ]);
    }


    public function destroy(Project $project, Stack $stack)
    {

        $project->stacks()
            ->detach($stack->id);


        return response()->json([
            'message' => 'Stack removed from project'
        ]);
    }
}
