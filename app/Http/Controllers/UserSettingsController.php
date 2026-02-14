<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Http\Resources\UserSettingsResource;
use App\Models\UserSetting;
use Illuminate\Http\Request;

/**
 * Kontroler ustawień użytkownika.
 *
 * Endpointy: show (GET), update (PUT).
 * Ustawienia tworzone automatycznie przy rejestracji.
 */
class UserSettingsController extends Controller
{
    /**
     * Pobierz ustawienia zalogowanego użytkownika.
     *
     * @param Request $request
     * @return UserSettingsResource|\Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $settings = $request->user()->settings;

        // Jeśli brak ustawień (edge case) — utwórz domyślne
        if (!$settings) {
            $settings = UserSetting::create([
                'user_id' => $request->user()->id,
            ]);
        }

        return (new UserSettingsResource($settings))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Aktualizuj ustawienia zalogowanego użytkownika.
     *
     * @param UpdateSettingsRequest $request
     * @return UserSettingsResource
     */
    public function update(UpdateSettingsRequest $request): UserSettingsResource
    {
        $settings = $request->user()->settings;

        if (!$settings) {
            $settings = UserSetting::create([
                'user_id' => $request->user()->id,
            ]);
        }

        $settings->update($request->validated());

        return new UserSettingsResource($settings->fresh());
    }
}
