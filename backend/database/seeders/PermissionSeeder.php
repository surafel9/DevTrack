<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'create_project',
                'description' => 'Can create new projects',
            ],
            [
                'name' => 'manage_users',
                'description' => 'Can manage company users',
            ],
            [
                'name' => 'assign_permissions',
                'description' => 'Can assign permissions to users',
            ],
            [
                'name' => 'manage_project_members',
                'description' => 'Can manage project members globally',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }
}
