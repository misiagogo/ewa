<?php

namespace Database\Factories;

use App\Models\GameRoom;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory dla modelu GameRoom.
 *
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GameRoom>
 */
class GameRoomFactory extends Factory
{
    protected $model = GameRoom::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $territories = config('game.territories', ['pine_forest', 'deciduous_forest', 'desert', 'mountains', 'swamp']);

        return [
            'name' => $this->faker->words(3, true),
            'host_user_id' => User::factory(),
            'territory' => $this->faker->randomElement($territories),
            'world_seed' => $this->faker->randomNumber(8),
            'max_players' => 10,
            'status' => 'waiting',
            'is_public' => true,
            'password' => null,
        ];
    }
}
