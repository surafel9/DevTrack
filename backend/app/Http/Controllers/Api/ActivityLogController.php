<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Project;

class ActivityLogController extends Controller
{
    /**
     * Return recent activity for a specific project.
     */
    public function index(Project $project)
    {
        $user = auth()->user();

        if (!$user->isCompanyAdmin() && !$project->members()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $activities = $project->activityLogs()
            ->with('user')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($log) => $this->formatLog($log));

        return response()->json($activities);
    }

    /**
     * Return recent activity across all projects the user can see.
     */
    public function dashboard()
    {
        $user  = auth()->user();
        $query = ActivityLog::with('user', 'project')->orderByDesc('created_at');

        if (!$user->isCompanyAdmin()) {
            $projectIds = $user->projects()->pluck('projects.id');
            $query->whereIn('project_id', $projectIds);
        }

        $activities = $query->limit(25)->get()->map(fn ($log) => $this->formatLog($log, withProject: true));

        return response()->json($activities);
    }

    private function formatLog(ActivityLog $log, bool $withProject = false): array
    {
        $actor = $log->user
            ? ['id' => $log->user->id, 'name' => $log->user->name]
            : ['id' => null, 'name' => 'System'];

        $text = match ($log->action) {
            'created_project' => 'created the project',
            'updated_project' => 'updated the project',
            'created_phase'   => 'created the ' . ($log->meta['name'] ?? 'phase') . ' phase',
            'updated_phase'   => 'updated the ' . ($log->meta['name'] ?? 'phase') . ' phase',
            'deleted_phase'   => 'deleted the ' . ($log->meta['name'] ?? 'phase') . ' phase',
            'added_comment'   => 'added a comment',
            'added_link'      => 'added a link: ' . ($log->meta['title'] ?? ''),
            'joined_project'  => 'joined the project',
            default           => $log->action,
        };

        $result = [
            'id'         => $log->id,
            'actor'      => $actor,
            'text'       => $text,
            'action'     => $log->action,
            'subject_type' => $log->subject_type,
            'subject_id'   => $log->subject_id,
            'meta'       => $log->meta,
            'created_at' => $log->created_at,
        ];

        if ($withProject && $log->project) {
            $result['project'] = [
                'id'   => $log->project->id,
                'name' => $log->project->name,
            ];
        }

        return $result;
    }
}
