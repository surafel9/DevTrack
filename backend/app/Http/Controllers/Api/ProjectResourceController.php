<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Requests\StoreProjectResourceRequest;
use App\Http\Requests\UpdateProjectResourceRequest;
use App\Models\ProjectResource;

class ProjectResourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Project $project)
    {
        return $project->resources;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectResourceRequest $request, Project $project)
    {
        $resource = $project->resources()->create(
            $request->validated()
        );

        return $resource;
    }

    /**
     * Display the specified resource.
     */
    public function show(ProjectResource $resource)
    {
        return $resource;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectResourceRequest $request, ProjectResource $resource)
    {
        //
        $resource->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProjectResource $resource)
    {
        //
        $resource->delete();

        return [
            'message' => 'Resource deleted successfully'
        ];
    }
}
