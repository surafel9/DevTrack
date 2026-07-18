<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Stack;

class StackController extends Controller
{
    public function index()
    {
        return response()->json(
            Stack::all()
        );
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:stacks,name'
        ]);


        $stack = Stack::create($validated);


        return response()->json(
            $stack,
            201
        );
    }
}
