<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Stack;

#[Fillable(['name', 'description', 'created_by', 'start_date', 'end_date'])]
class Project extends Model
{
    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    protected $appends = ['progress', 'status'];

    /**
     * Top-level phases only (no parent).
     */
    public function phases(): HasMany
    {
        return $this->hasMany(Phase::class)
            ->whereNull('parent_id')
            ->orderBy('order');
    }

    /**
     * All phases (including nested children) – used for progress calculation.
     */
    public function allPhases(): HasMany
    {
        return $this->hasMany(Phase::class)->orderBy('order');
    }

    /**
     * Progress is calculated from LEAF phases only to avoid double-counting.
     * A leaf phase is one that has no children.
     */
    protected function progress(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Load all phases for the project
                $all = $this->allPhases()->get();

                if ($all->isEmpty()) {
                    return 0;
                }

                // Identify leaf phases (phases with no children)
                $parentIds = $all->pluck('parent_id')->filter()->unique();
                $leaves = $all->whereNotIn('id', $parentIds);

                if ($leaves->isEmpty()) {
                    // No leaves (shouldn't happen) – fall back to all phases
                    $leaves = $all;
                }

                $total     = $leaves->count();
                $completed = $leaves->where('status', 'completed')->count();

                return round(($completed / $total) * 100);
            }
        );
    }

    /**
     * Derived project status based on phase states.
     * Admins and frontend should always use this instead of a manual status field.
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: function () {
                $all = $this->allPhases()->get();

                if ($all->isEmpty()) {
                    return 'pending';
                }

                $parentIds = $all->pluck('parent_id')->filter()->unique();
                $leaves    = $all->whereNotIn('id', $parentIds);

                if ($leaves->isEmpty()) {
                    $leaves = $all;
                }

                $total     = $leaves->count();
                $completed = $leaves->where('status', 'completed')->count();
                $active    = $leaves->where('status', 'active')->count();

                if ($completed === $total) {
                    return 'completed';
                }

                if ($active > 0 || $completed > 0) {
                    return 'in_progress';
                }

                return 'pending';
            }
        );
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->with('user')->orderByDesc('created_at');
    }

    public function links(): HasMany
    {
        return $this->hasMany(Link::class);
    }

    public function stacks(): BelongsToMany
    {
        return $this->belongsToMany(Stack::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(ProjectResource::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class)->with('user')->orderByDesc('created_at');
    }
}
