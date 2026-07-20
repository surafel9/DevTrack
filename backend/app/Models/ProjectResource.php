<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectResource extends Model
{
    protected $fillable = [
        'title',
        'url',
        'username',
        'password',
    ];
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
