<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PhaseController;



Route::apiResource('projects', ProjectController::class);
Route::apiResource('phases', PhaseController::class);
Route::post('/projects/{project}/phases', [PhaseController::class, 'store']);
