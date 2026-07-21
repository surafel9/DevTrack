<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Stack;

#[Fillable(['name', 'description', 'created_by'])]
class Project extends Model
{
    public function phases(): HasMany
    {
        return $this->hasMany(Phase::class)
            ->orderBy('order');
    }
    protected $appends = [
        'progress',
    ];

    protected function progress(): Attribute
    {
        return Attribute::make(
            get: function () {

                $total = $this->phases->count();

                if ($total === 0) {
                    return 0;
                }

                $completed = $this->phases
                    ->where('status', 'completed')
                    ->count();

                return round(($completed / $total) * 100);
            }
        );
    }
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'project_members'
        );
    }
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
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
}
