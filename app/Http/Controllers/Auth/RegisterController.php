<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

/**
 * Kontroler rejestracji użytkownika.
 *
 * Tworzy nowego użytkownika z domyślnymi ustawieniami gry
 * i zwraca token Sanctum do autoryzacji API.
 */
class RegisterController extends Controller
{
    /**
     * Rejestracja nowego użytkownika.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        // Tworzenie domyślnych ustawień gry dla nowego użytkownika
        UserSetting::create([
            'user_id' => $user->id,
        ]);

        $token = $user->createToken('cat-survival')->plainTextToken;

        return response()->json([
            'message' => __('auth.registered'),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
        ], 201);
    }
}
