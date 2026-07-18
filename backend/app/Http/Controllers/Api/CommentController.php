<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Project $project)
    {
        return response()->json(
            $project->comments
        );
    }


    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'content' => [
                'required',
                'string'
            ],
        ]);

        $comment = $project->comments()->create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);


        return response()->json(
            $comment,
            201
        );
    }


    public function destroy(Comment $comment)
    {
        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted'
        ]);
    }
}
