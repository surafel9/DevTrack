<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\User;

class ProjectController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = Project::with('phases', 'members', 'links', 'stacks', 'comments');

        if (!$user->isCompanyAdmin()) {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        }

        return ProjectResource::collection($query->get());
    }

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $project = Project::create($data);

        $membersToAdd = collect([$request->user()->id]);
        
        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            if ($adminId !== $request->user()->id) {
                $membersToAdd->push($adminId);
            }
        }

        $project->members()->attach($membersToAdd->toArray());

        return new ProjectResource($project);
    }

    public function show(Project $project)
    {
        $user = auth()->user();

        if (!$user->isCompanyAdmin() && !$project->members()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized or project not found.'], 403);
        }

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
