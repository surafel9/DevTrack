<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhaseRequest;
use App\Http\Requests\UpdatePhaseRequest;
use App\Http\Resources\PhaseResource;
use App\Models\ActivityLog;
use App\Models\Phase;
use App\Models\Project;

class PhaseController extends Controller
{
    /**
     * Return all top-level phases with nested children.
     */
    public function index(Project $project)
    {
        $phases = $project->phases()->with('childrenRecursive')->get();

        return PhaseResource::collection($phases);
    }

    public function store(StorePhaseRequest $request, Project $project)
    {
        $data      = $request->validated();
        $parentId  = $data['parent_id'] ?? null;

        // Calculate order within the same parent context
        $orderQuery = $project->allPhases()->where('parent_id', $parentId);
        $data['order'] = ($orderQuery->max('order') ?? 0) + 1;

        if (!isset($data['status'])) {
            $data['status'] = 'pending';
        }

        $phase = $project->allPhases()->create($data);

        // Reload with children
        $phase->load('childrenRecursive');

        // Log activity
        ActivityLog::create([
            'project_id'   => $project->id,
            'user_id'      => auth()->id(),
            'action'       => 'created_phase',
            'subject_type' => 'phase',
            'subject_id'   => $phase->id,
            'meta'         => ['name' => $phase->name],
        ]);

        return new PhaseResource($phase);
    }

    public function update(UpdatePhaseRequest $request, Project $project, Phase $phase)
    {
        abort_if($phase->project_id !== $project->id, 404);

        $phase->update($request->validated());
        $phase->load('childrenRecursive');

        // Log activity
        ActivityLog::create([
            'project_id'   => $project->id,
            'user_id'      => auth()->id(),
            'action'       => 'updated_phase',
            'subject_type' => 'phase',
            'subject_id'   => $phase->id,
            'meta'         => ['name' => $phase->name, 'status' => $phase->status],
        ]);

        return new PhaseResource($phase);
    }

    public function destroy(Project $project, Phase $phase)
    {
        abort_if($phase->project_id !== $project->id, 404);

        $name = $phase->name;
        $phase->delete();

        // Log activity
        ActivityLog::create([
            'project_id'   => $project->id,
            'user_id'      => auth()->id(),
            'action'       => 'deleted_phase',
            'subject_type' => 'phase',
            'subject_id'   => $phase->id,
            'meta'         => ['name' => $name],
        ]);

        return response()->json(['message' => 'Phase deleted successfully']);
    }
}
