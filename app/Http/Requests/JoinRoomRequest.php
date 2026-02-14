<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Walidacja dołączania do pokoju multiplayer.
 */
class JoinRoomRequest extends FormRequest
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
            'password' => ['sometimes', 'nullable', 'string'],
            'cat_config' => ['required', 'array'],
            'cat_config.name' => ['required', 'string', 'max:50'],
            'cat_config.fur_color' => ['required', 'string'],
            'cat_config.pattern' => ['required', 'string', 'in:' . implode(',', config('game.cat_patterns'))],
            'cat_config.eye_color' => ['required', 'string'],
            'cat_config.age' => ['required', 'string', 'in:' . implode(',', config('game.cat_ages'))],
            'cat_config.gender' => ['required', 'string', 'in:' . implode(',', config('game.cat_genders'))],
        ];
    }
}
