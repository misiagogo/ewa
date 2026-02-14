<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Walidacja aktualizacji ustawień użytkownika.
 *
 * Wszystkie pola opcjonalne — aktualizowane są tylko przesłane.
 */
class UpdateSettingsRequest extends FormRequest
{
    /**
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'language' => ['sometimes', 'string', 'in:pl,en'],
            'graphics_quality' => ['sometimes', 'string', 'in:low,medium,high'],
            'view_distance' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'sound_volume' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'autosave_enabled' => ['sometimes', 'boolean'],
            'autosave_interval' => ['sometimes', 'integer', 'min:10', 'max:300'],
        ];
    }
}
