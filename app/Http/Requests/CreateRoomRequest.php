<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Walidacja tworzenia pokoju multiplayer.
 */
class CreateRoomRequest extends FormRequest
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
        $territories = implode(',', config('game.territories'));

        return [
            'name' => ['required', 'string', 'max:100'],
            'territory' => ['required', 'string', 'in:' . $territories],
            'max_players' => ['sometimes', 'integer', 'min:2', 'max:20'],
            'is_public' => ['sometimes', 'boolean'],
            'password' => ['sometimes', 'nullable', 'string', 'min:4'],
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
