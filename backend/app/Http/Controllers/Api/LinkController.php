<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Link;

class LinkController extends Controller
{

    public function index(Project $project)
    {
        return response()->json(
            $project->links
        );
    }


    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url',
        ]);


        $link = $project->links()->create($validated);


        return response()->json(
            $link,
            201
        );
    }


    public function destroy(Link $link)
    {
        $link->delete();


        return response()->json([
            'message' => 'Link deleted'
        ]);
    }
}
