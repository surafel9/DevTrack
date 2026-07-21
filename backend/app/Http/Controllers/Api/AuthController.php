<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([

            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'email' => [
                'required',
                'email',
                'unique:users'
            ],

            'password' => [
                'required',
                'min:8'
            ]

        ]);


        $user = User::create([

            'name' => $validated['name'],

            'email' => $validated['email'],

            'password' => $validated['password']

        ]);


        $token = $user
            ->createToken('devtrack-token')
            ->plainTextToken;

        $user->load('permissions');

        return response()->json([
            'user' => array_merge($user->toArray(), [
                'permissions' => $user->permissions->pluck('name'),
            ]),
            'token' => $token,
        ], 201);
    }



    public function login(Request $request)
    {
        $validated = $request->validate([

            'email' => [
                'required',
                'email'
            ],

            'password' => [
                'required'
            ]

        ]);


        $user = User::where(
            'email',
            $validated['email']
        )->first();


        if (
            !$user ||
            !Hash::check(
                $validated['password'],
                $user->password
            )
        ) {

            return response()->json([

                'message' => 'Invalid credentials'

            ], 401);
        }


        $token = $user
            ->createToken('devtrack-token')
            ->plainTextToken;

        $user->load('permissions');

        return response()->json([
            'user' => array_merge($user->toArray(), [
                'permissions' => $user->permissions->pluck('name'),
            ]),
            'token' => $token,
        ]);
    }



    public function profile(Request $request)
    {
        $user = $request->user()->load('permissions');

        return response()->json(
            array_merge($user->toArray(), [
                'permissions' => $user->permissions->pluck('name'),
            ])
        );
    }



    public function logout(Request $request)
    {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();


        return response()->json([

            'message' => 'Logged out successfully'

        ]);
    }
}
