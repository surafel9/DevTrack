<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PhaseController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\StackController;
use App\Http\Controllers\Api\ProjectStackController;
use App\Http\Controllers\Api\ProjectResourceController;
use App\Http\Controllers\Api\ProjectMemberController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ActivityLogController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{user}/permissions', [UserController::class, 'updatePermissions'])
        ->middleware('company.admin');

    // Projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store'])->middleware('permission:create_project');
    Route::get('/projects/{project}', [ProjectController::class, 'show']);

    // Edit project: admin OR employee with edit_project permission (enforced in UpdateProjectRequest)
    Route::put('/projects/{project}', [ProjectController::class, 'update']);

    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
        ->middleware('company.admin');

    // Phases (with nested phase support)
    Route::get('/projects/{project}/phases', [PhaseController::class, 'index'])->middleware('project.member');
    Route::post('/projects/{project}/phases', [PhaseController::class, 'store'])->middleware('project.member');
    Route::put('/projects/{project}/phases/{phase}', [PhaseController::class, 'update'])->middleware('project.member');
    Route::delete('/projects/{project}/phases/{phase}', [PhaseController::class, 'destroy'])->middleware('project.member');

    // Comments
    Route::get('/projects/{project}/comments', [CommentController::class, 'index'])->middleware('project.member');
    Route::post('/projects/{project}/comments', [CommentController::class, 'store'])->middleware('project.member');
    Route::post('/comments/{comment}/read', [CommentController::class, 'markRead']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Links
    Route::get('/projects/{project}/links', [LinkController::class, 'index'])->middleware('project.member');
    Route::post('/projects/{project}/links', [LinkController::class, 'store'])->middleware('project.member');
    Route::delete('/links/{link}', [LinkController::class, 'destroy'])->middleware('project.member');

    // Stacks
    Route::get('/stacks', [StackController::class, 'index']);
    Route::post('/stacks', [StackController::class, 'store']);
    Route::get('/projects/{project}/stacks', [ProjectStackController::class, 'index'])->middleware('project.member');
    Route::post('/projects/{project}/stacks/{stack}', [ProjectStackController::class, 'store'])->middleware('project.member');
    Route::delete('/projects/{project}/stacks/{stack}', [ProjectStackController::class, 'destroy'])->middleware('project.member');

    // Resources
    Route::get('/projects/{project}/resources', [ProjectResourceController::class, 'index'])->middleware('project.member');
    Route::post('/projects/{project}/resources', [ProjectResourceController::class, 'store'])->middleware('project.member');
    Route::get('/resources/{resource}', [ProjectResourceController::class, 'show']);
    Route::put('/resources/{resource}', [ProjectResourceController::class, 'update']);
    Route::delete('/resources/{resource}', [ProjectResourceController::class, 'destroy']);

    // Members
    Route::get('/projects/{project}/members', [ProjectMemberController::class, 'index'])->middleware('project.member');
    Route::post('/projects/{project}/members', [ProjectMemberController::class, 'store'])
        ->middleware('permission:manage_project_members');
    Route::delete('/projects/{project}/members/{userId}', [ProjectMemberController::class, 'destroy'])
        ->middleware('permission:manage_project_members');

    // Activity Logs
    Route::get('/projects/{project}/activity', [ActivityLogController::class, 'index'])->middleware('project.member');
    Route::get('/activity/dashboard', [ActivityLogController::class, 'dashboard']);
});
