<?php

namespace Database\Factories;

use App\Models\GameSave;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory dla modelu GameSave.
 *
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GameSave>
 */
class GameSaveFactory extends Factory
{
    protected $model = GameSave::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $territories = config('game.territories', ['pine_forest', 'deciduous_forest', 'desert', 'mountains', 'swamp']);

        return [
            'user_id' => User::factory(),
            'slot' => $this->faker->unique()->numberBetween(1, 3),
            'name' => $this->faker->words(2, true),
            'territory' => $this->faker->randomElement($territories),
            'cat_config' => [
                'name' => $this->faker->firstName(),
                'fur_color' => $this->faker->hexColor(),
                'pattern' => $this->faker->randomElement(['solid', 'striped', 'spotted']),
                'eye_color' => $this->faker->hexColor(),
                'age' => $this->faker->randomElement(['young', 'adult', 'senior']),
                'gender' => $this->faker->randomElement(['male', 'female']),
            ],
            'game_state' => [
                'position' => [
                    'x' => $this->faker->randomFloat(2, -100, 100),
                    'y' => 0,
                    'z' => $this->faker->randomFloat(2, -100, 100),
                ],
                'world_seed' => $this->faker->randomNumber(8),
            ],
            'version' => 1,
        ];
    }
}
