<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'content',
        'user_id',
    ];


    public function project()
    {
        return $this->belongsTo(Project::class);
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
