<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;

class ProjectController extends Controller
{
    public function index()
    {
        return ProjectResource::collection(
            Project::with('phases', 'members', 'links', 'stacks', 'comments')->get()
        );
    }

    public function store(StoreProjectRequest $request)
    {
        $project = Project::create(
            $request->validated()
        );

        $project->members()->attach(
            $request->user()->id
        );

        return new ProjectResource($project);
    }

    public function show(Project $project)
    {
        $project->load('phases', 'members', 'links', 'stacks', 'comments');

        return new ProjectResource($project);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update(
            $request->validated()
        );

        return new ProjectResource($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully'
        ]);
    }
}
