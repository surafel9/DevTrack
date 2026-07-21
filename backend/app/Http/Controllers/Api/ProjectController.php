<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;

class ProjectController extends Controller
{
    public function index()
    {
        $user  = auth()->user();
        $query = Project::with('phases', 'allPhases', 'members', 'links', 'stacks', 'comments.user');

        if (!$user->isCompanyAdmin()) {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        }

        return ProjectResource::collection($query->get());
    }

    public function store(StoreProjectRequest $request)
    {
        $data               = $request->validated();
        $data['created_by'] = $request->user()->id;

        $project = Project::create($data);

        // Auto-add creator and all admins as members
        $membersToAdd = collect([$request->user()->id]);
        $admins       = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            if ($adminId !== $request->user()->id) {
                $membersToAdd->push($adminId);
            }
        }
        $project->members()->attach($membersToAdd->toArray());

        // Log activity
        ActivityLog::create([
            'project_id'   => $project->id,
            'user_id'      => $request->user()->id,
            'action'       => 'created_project',
            'subject_type' => 'project',
            'subject_id'   => $project->id,
            'meta'         => ['name' => $project->name],
        ]);

        return new ProjectResource($project);
    }

    public function show(Project $project)
    {
        $user = auth()->user();

        if (!$user->isCompanyAdmin() && !$project->members()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized or project not found.'], 403);
        }

        $project->load('allPhases.childrenRecursive', 'members', 'links', 'stacks', 'comments.user', 'activityLogs.user');

        return new ProjectResource($project);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        // Log activity
        ActivityLog::create([
            'project_id'   => $project->id,
            'user_id'      => $request->user()->id,
            'action'       => 'updated_project',
            'subject_type' => 'project',
            'subject_id'   => $project->id,
            'meta'         => ['name' => $project->name],
        ]);

        $project->load('allPhases.childrenRecursive', 'members', 'links', 'stacks', 'comments.user', 'activityLogs.user');

        return new ProjectResource($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}
