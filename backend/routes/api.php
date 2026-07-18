<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PhaseController;
use App\Http\Controllers\Api\ProjectUserController;



Route::apiResource('projects', ProjectController::class);

Route::get('/projects/{project}/phases', [PhaseController::class, 'index']);
Route::post('/projects/{project}/phases', [PhaseController::class, 'store']);

Route::put('/projects/{project}/phases/{phase}', [PhaseController::class, 'update']);
Route::delete('/projects/{project}/phases/{phase}', [PhaseController::class, 'destroy']);


Route::get('/projects/{project}/users', [ProjectUserController::class, 'index']);
Route::post('/projects/{project}/users/{user}', [ProjectUserController::class, 'store']);
Route::delete('/projects/{project}/users/{user}', [ProjectUserController::class, 'destroy']);
