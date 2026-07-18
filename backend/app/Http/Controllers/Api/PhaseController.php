<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Phase;
use Illuminate\Http\Request;
use App\Models\Project;

class PhaseController extends Controller
{

    public function index(Project $project)
    {
        return response()->json(
            $project->phases
        );
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string',
            // 'order' => 'required|integer|min:1',
        ]);

        $validated['order'] = ($project->phases()->max('order') ?? 0) + 1;

        $phase = $project->phases()->create($validated);

        return response()->json($phase, 201);
    }

    public function show(Phase $phase)
    {
        return response()->json($phase);
    }

    public function update(Request $request, Project $project, Phase $phase)
    {
        abort_if($phase->project_id !== $project->id, 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string',
            'order' => 'required|integer|min:1',
        ]);

        $phase->update($validated);

        return response()->json($phase);
    }

    public function destroy(Project $project, Phase $phase)
    {
        abort_if($phase->project_id !== $project->id, 404);

        $phase->delete();

        return response()->json([
            'message' => 'Phase deleted successfully',
        ]);
    }
}
