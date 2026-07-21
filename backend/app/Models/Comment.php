<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'content',
        'user_id',
        'project_id',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Users who have read this comment.
     */
    public function readers()
    {
        return $this->belongsToMany(User::class, 'comment_reads')
            ->withPivot('read_at')
            ->withTimestamps();
    }
}
