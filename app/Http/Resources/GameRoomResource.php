<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transformer pokoju gry multiplayer.
 */
class GameRoomResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'host_user_id' => $this->host_user_id,
            'host_name' => $this->whenLoaded('host', fn () => $this->host->name),
            'territory' => $this->territory,
            'world_seed' => $this->world_seed,
            'max_players' => $this->max_players,
            'players_count' => $this->whenCounted('players', $this->players_count),
            'status' => $this->status,
            'is_public' => $this->is_public,
            'players' => $this->whenLoaded('players', function () {
                return $this->players->map(fn ($p) => [
                    'user_id' => $p->user_id,
                    'name' => $p->user?->name,
                    'cat_config' => $p->cat_config,
                    'position' => [
                        'x' => $p->position_x,
                        'y' => $p->position_y,
                        'z' => $p->position_z,
                    ],
                    'rotation_y' => $p->rotation_y,
                    'joined_at' => $p->joined_at?->toISOString(),
                ]);
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
