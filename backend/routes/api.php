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

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {


    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('projects', ProjectController::class)->except(['store']);
    Route::post('/projects', [ProjectController::class, 'store'])
        ->middleware('permission:create_project');

    Route::get('/projects/{project}/phases', [PhaseController::class, 'index']);
    Route::post('/projects/{project}/phases', [PhaseController::class, 'store']);
    Route::put('/projects/{project}/phases/{phase}', [PhaseController::class, 'update']);
    Route::delete('/projects/{project}/phases/{phase}', [PhaseController::class, 'destroy']);


    Route::get('/projects/{project}/comments', [CommentController::class, 'index']);
    Route::post('/projects/{project}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);


    Route::get('/projects/{project}/links', [LinkController::class, 'index']);
    Route::post('/projects/{project}/links', [LinkController::class, 'store']);
    Route::delete('/links/{link}', [LinkController::class, 'destroy']);


    Route::get('/stacks', [StackController::class, 'index']);
    Route::post('/stacks', [StackController::class, 'store']);

    Route::get('/projects/{project}/stacks', [ProjectStackController::class, 'index']);
    Route::post('/projects/{project}/stacks/{stack}', [ProjectStackController::class, 'store']);
    Route::delete('/projects/{project}/stacks/{stack}', [ProjectStackController::class, 'destroy']);


    Route::get('/projects/{project}/resources', [ProjectResourceController::class, 'index']);
    Route::post('/projects/{project}/resources', [ProjectResourceController::class, 'store']);
    Route::get('/resources/{resource}', [ProjectResourceController::class, 'show']);
    Route::put('/resources/{resource}', [ProjectResourceController::class, 'update']);
    Route::delete('/resources/{resource}', [ProjectResourceController::class, 'destroy']);


    Route::get('/projects/{project}/members', [ProjectMemberController::class, 'index']);
    Route::post('/projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::delete('/projects/{project}/members/{userId}', [ProjectMemberController::class, 'destroy']);
});
