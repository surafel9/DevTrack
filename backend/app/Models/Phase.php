<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'project_id',
    'parent_id',
    'name',
    'status',
    'order',
])]
class Phase extends Model
{
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Parent phase (null for top-level phases).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Phase::class, 'parent_id');
    }

    /**
     * Direct child phases.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Phase::class, 'parent_id')->orderBy('order');
    }

    /**
     * Recursively loaded children with their own children.
     */
    public function childrenRecursive(): HasMany
    {
        return $this->hasMany(Phase::class, 'parent_id')
            ->orderBy('order')
            ->with('childrenRecursive');
    }
}
