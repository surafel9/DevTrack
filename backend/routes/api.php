<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PhaseController;
use App\Http\Controllers\Api\ProjectUserController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\StackController;
use App\Http\Controllers\Api\ProjectStackController;
use App\Http\Controllers\Api\AuthController;


Route::apiResource('projects', ProjectController::class);

Route::get('/projects/{project}/phases', [PhaseController::class, 'index']);
Route::post('/projects/{project}/phases', [PhaseController::class, 'store']);

Route::put('/projects/{project}/phases/{phase}', [PhaseController::class, 'update']);
Route::delete('/projects/{project}/phases/{phase}', [PhaseController::class, 'destroy']);


Route::get('/projects/{project}/users', [ProjectUserController::class, 'index']);
Route::post('/projects/{project}/users/{user}', [ProjectUserController::class, 'store']);
Route::delete('/projects/{project}/users/{user}', [ProjectUserController::class, 'destroy']);


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


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
