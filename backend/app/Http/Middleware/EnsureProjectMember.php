<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Project;

class EnsureProjectMember
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        $project = $request->route('project');

        if ($user->isCompanyAdmin()) {
            return $next($request);
        }

        if (! $project instanceof Project) {
            abort(404, 'Project not found.');
        }

        if (! $project->members()
            ->where('users.id', $user->id)
            ->exists()) {
            abort(403, 'You are not a member of this project.');
        }

        return $next($request);
    }
}
