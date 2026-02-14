<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Walidacja tworzenia/aktualizacji save'a gry.
 *
 * Waliduje slot (0-3), territory, cat_config (JSON), game_state (JSON).
 */
class SaveGameRequest extends FormRequest
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
            'slot' => ['required', 'integer', 'min:0', 'max:' . config('game.max_save_slots')],
            'name' => ['nullable', 'string', 'max:100'],
            'territory' => ['required', 'string', 'in:' . $territories],
            'cat_config' => ['required', 'array'],
            'cat_config.name' => ['required', 'string', 'max:50'],
            'cat_config.fur_color' => ['required', 'string'],
            'cat_config.pattern' => ['required', 'string', 'in:' . implode(',', config('game.cat_patterns'))],
            'cat_config.eye_color' => ['required', 'string'],
            'cat_config.age' => ['required', 'string', 'in:' . implode(',', config('game.cat_ages'))],
            'cat_config.gender' => ['required', 'string', 'in:' . implode(',', config('game.cat_genders'))],
            'game_state' => ['required', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slot.required' => __('validation.required', ['attribute' => 'slot']),
            'territory.required' => __('validation.required', ['attribute' => __('game.territory')]),
            'territory.in' => __('validation.in', ['attribute' => __('game.territory')]),
            'cat_config.required' => __('validation.required', ['attribute' => __('game.cat_config')]),
            'game_state.required' => __('validation.required', ['attribute' => __('game.game_state')]),
        ];
    }
}
