<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'start_date'  => $this->start_date?->toDateString(),
            'end_date'    => $this->end_date?->toDateString(),
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
            'progress'    => $this->progress,
            'status'      => $this->status,
            'created_by'  => $this->created_by,

            // Top-level phases with nested children
            'phases' => PhaseResource::collection(
                $this->whenLoaded('allPhases', function () {
                    // Return only root phases; nested children are loaded via childrenRecursive
                    return $this->allPhases->whereNull('parent_id')->values();
                })
            ),

            'users'    => $this->whenLoaded('members'),
            'links'    => $this->whenLoaded('links'),
            'stacks'   => $this->whenLoaded('stacks'),
            'comments' => $this->whenLoaded('comments', function () {
                $user = auth()->user();
                if (!$user) return $this->comments;
                
                $readCommentIds = \DB::table('comment_reads')
                    ->where('user_id', $user->id)
                    ->pluck('comment_id')
                    ->flip();

                return $this->comments->map(function ($comment) use ($readCommentIds) {
                    $commentArray = $comment->toArray();
                    $commentArray['user'] = $comment->user ? $comment->user->toArray() : null;
                    $commentArray['is_unread'] = !isset($readCommentIds[$comment->id]);
                    return $commentArray;
                });
            }),
            'activity' => $this->whenLoaded('activityLogs', function () {
                return $this->activityLogs->map(function ($log) {
                    return [
                        'id'           => $log->id,
                        'action'       => $log->action,
                        'subject_type' => $log->subject_type,
                        'subject_id'   => $log->subject_id,
                        'meta'         => $log->meta,
                        'created_at'   => $log->created_at,
                        'actor'        => $log->user
                            ? ['id' => $log->user->id, 'name' => $log->user->name]
                            : ['id' => null, 'name' => 'System'],
                    ];
                });
            }),
        ];
    }
}
