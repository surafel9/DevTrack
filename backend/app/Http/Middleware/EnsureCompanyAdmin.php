<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyAdmin
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        if ($request->user()->isCompanyAdmin()) {
            return $next($request);
        }

        abort(403, 'Only company administrators can perform this action.');
    }
}
