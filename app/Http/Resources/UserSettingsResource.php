<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transformer ustawień użytkownika.
 *
 * Formatuje dane ustawień do odpowiedzi JSON API.
 */
class UserSettingsResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'language' => $this->language,
            'graphics_quality' => $this->graphics_quality,
            'view_distance' => $this->view_distance,
            'sound_volume' => $this->sound_volume,
            'autosave_enabled' => $this->autosave_enabled,
            'autosave_interval' => $this->autosave_interval,
        ];
    }
}
