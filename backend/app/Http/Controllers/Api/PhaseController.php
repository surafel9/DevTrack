<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhaseRequest;
use App\Http\Requests\UpdatePhaseRequest;
use App\Http\Resources\PhaseResource;
use App\Models\Phase;
use App\Models\Project;

class PhaseController extends Controller
{
    public function index(Project $project)
    {
        return PhaseResource::collection(
            $project->phases
        );
    }


    public function store(StorePhaseRequest $request, Project $project)
    {
        $data = $request->validated();

        $data['order'] = ($project->phases()->max('order') ?? 0) + 1;

        $phase = $project->phases()->create($data);

        return new PhaseResource($phase);
    }


    public function update(
        UpdatePhaseRequest $request,
        Project $project,
        Phase $phase
    ) {
        abort_if($phase->project_id !== $project->id, 404);

        $phase->update(
            $request->validated()
        );

        return new PhaseResource($phase);
    }


    public function destroy(Project $project, Phase $phase)
    {
        abort_if($phase->project_id !== $project->id, 404);

        $phase->delete();

        return response()->json([
            'message' => 'Phase deleted successfully'
        ]);
    }
}
