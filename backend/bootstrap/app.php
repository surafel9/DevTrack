<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use App\Http\Middleware\CheckPermission;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\EnsureProjectMember;
use App\Http\Middleware\EnsureCompanyAdmin;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        $middleware->alias([
            'permission' => CheckPermission::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('api/*')) {
                return null;
            }

            return route('login');
        });
        $middleware->alias([
            'permission' => CheckPermission::class,
            'project.member' => EnsureProjectMember::class,
        ]);
        $middleware->alias([
            'permission' => CheckPermission::class,
            'project.member' => EnsureProjectMember::class,
            'company.admin' => EnsureCompanyAdmin::class,
        ]);
    })


    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*'),
        );
    })->create();
