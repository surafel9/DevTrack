<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'description'])]
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
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
