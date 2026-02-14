<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

/**
 * Kontroler logowania użytkownika.
 *
 * Weryfikuje dane logowania, aktualizuje last_login_at
 * i zwraca token Sanctum do autoryzacji API.
 */
class LoginController extends Controller
{
    /**
     * Logowanie użytkownika.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (!$user || !Hash::check($request->validated('password'), $user->password)) {
            return response()->json([
                'message' => __('auth.failed'),
            ], 401);
        }

        // Aktualizacja ostatniego logowania
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('cat-survival')->plainTextToken;

        return response()->json([
            'message' => __('auth.logged_in'),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
        ]);
    }
}
