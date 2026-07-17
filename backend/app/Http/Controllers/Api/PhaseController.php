<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Phase;
use Illuminate\Http\Request;
use App\Models\Project;

class PhaseController extends Controller
{
    public function index()
    {
        return response()->json(
            Phase::all()
        );
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'nullable|string',
            'order' => 'required|integer',
        ]);

        $phase = $project->phases()->create($validated);

        return response()->json($phase, 201);
    }

    public function show(Phase $phase)
    {
        return response()->json($phase);
    }

    public function update(Request $request, Phase $phase)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'nullable|string',
            'order' => 'required|integer',
        ]);

        $phase->update($validated);

        return response()->json($phase);
    }

    public function destroy(Phase $phase)
    {
        $phase->delete();

        return response()->json([
            'message' => 'Phase deleted successfully'
        ]);
    }
}
