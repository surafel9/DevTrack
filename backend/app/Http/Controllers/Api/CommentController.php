<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Project $project)
    {
        $user     = auth()->user();
        $comments = $project->comments()->with('user')->orderByDesc('created_at')->get();

        // Attach is_unread flag for the current user
        $readCommentIds = \DB::table('comment_reads')
            ->where('user_id', $user->id)
            ->pluck('comment_id')
            ->flip();

        $comments = $comments->map(function ($comment) use ($readCommentIds) {
            $comment->is_unread = !isset($readCommentIds[$comment->id]);
            return $comment;
        });

        return response()->json($comments);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $comment = $project->comments()->create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        $comment->load('user');

        // Log activity
        ActivityLog::create([
            'project_id'   => $project->id,
            'user_id'      => Auth::id(),
            'action'       => 'added_comment',
            'subject_type' => 'comment',
            'subject_id'   => $comment->id,
            'meta'         => ['snippet' => substr($comment->content, 0, 80)],
        ]);

        // Mark as read by author immediately
        \DB::table('comment_reads')->insertOrIgnore([
            'comment_id' => $comment->id,
            'user_id'    => Auth::id(),
            'read_at'    => now(),
        ]);

        return response()->json($comment, 201);
    }

    /**
     * Mark a comment as read by the authenticated user.
     */
    public function markRead(Comment $comment)
    {
        \DB::table('comment_reads')->insertOrIgnore([
            'comment_id' => $comment->id,
            'user_id'    => Auth::id(),
            'read_at'    => now(),
        ]);

        return response()->json(['message' => 'Marked as read']);
    }

    public function destroy(Comment $comment)
    {
        $user = auth()->user();

        // Admin can delete any comment; regular users can only delete their own
        if (!$user->isCompanyAdmin() && $comment->user_id !== $user->id) {
            return response()->json(['message' => 'You can only delete your own comments.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}
