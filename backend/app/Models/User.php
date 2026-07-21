<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

use Laravel\Sanctum\HasApiTokens;


#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;


    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isCompanyAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function projects(): BelongsToMany
    {

        return $this->belongsToMany(
            Project::class,
            'project_members'
        );
    }


    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            Permission::class,
            'user_permissions'
        );
    }
    public function hasPermission(string $permission): bool
    {
        if ($this->isCompanyAdmin()) {
            return true;
        }

        return $this->permissions()
            ->where('name', $permission)
            ->exists();
    }
}
