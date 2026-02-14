<?php

namespace Tests\Feature;

use App\Models\GameSave;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy CRUD save'ów gry + autosave.
 */
class GameSaveTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Pomocnicza metoda: dane poprawnego save'a.
     */
    private function validSaveData(int $slot = 1): array
    {
        return [
            'slot' => $slot,
            'name' => 'Test Save',
            'territory' => 'pine_forest',
            'cat_config' => [
                'name' => 'Mruczek',
                'fur_color' => '#ff8800',
                'pattern' => 'striped',
                'eye_color' => '#00ff00',
                'age' => 'adult',
                'gender' => 'male',
            ],
            'game_state' => [
                'position' => ['x' => 10, 'y' => 0, 'z' => 20],
                'world_seed' => 12345,
            ],
        ];
    }

    /**
     * Pomocnicza metoda: zalogowany użytkownik z tokenem.
     */
    private function authenticatedUser(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $token];
    }

    public function test_user_can_create_save(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/saves', $this->validSaveData());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'slot', 'name', 'territory', 'cat_config', 'game_state', 'version'],
            ]);

        $this->assertDatabaseHas('game_saves', [
            'user_id' => $user->id,
            'slot' => 1,
            'territory' => 'pine_forest',
        ]);
    }

    public function test_user_can_list_saves(): void
    {
        [$user, $token] = $this->authenticatedUser();

        GameSave::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/saves');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_show_save(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $save = GameSave::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/saves/' . $save->id);

        $response->assertStatus(200)
            ->assertJson(['data' => ['id' => $save->id]]);
    }

    public function test_user_cannot_see_other_users_save(): void
    {
        [$user, $token] = $this->authenticatedUser();
        $otherUser = User::factory()->create();
        $save = GameSave::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/saves/' . $save->id);

        $response->assertStatus(404);
    }

    public function test_user_can_update_save(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $save = GameSave::factory()->create([
            'user_id' => $user->id,
            'slot' => 1,
            'territory' => 'pine_forest',
        ]);

        $updateData = $this->validSaveData(1);
        $updateData['name'] = 'Updated Save';

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/saves/' . $save->id, $updateData);

        $response->assertStatus(200)
            ->assertJson(['data' => ['name' => 'Updated Save']]);
    }

    public function test_user_can_delete_save(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $save = GameSave::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/saves/' . $save->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('game_saves', ['id' => $save->id]);
    }

    public function test_autosave_creates_slot_zero(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $data = $this->validSaveData(0);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/saves/autosave', $data);

        $response->assertStatus(200)
            ->assertJson(['data' => ['slot' => 0]]);

        $this->assertDatabaseHas('game_saves', [
            'user_id' => $user->id,
            'slot' => 0,
        ]);
    }

    public function test_autosave_upserts_slot_zero(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $data = $this->validSaveData(0);

        // Pierwszy autosave
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/saves/autosave', $data);

        // Drugi autosave — powinien nadpisać
        $data['game_state'] = ['position' => ['x' => 99, 'y' => 0, 'z' => 99]];
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/saves/autosave', $data);

        $this->assertDatabaseCount('game_saves', 1);
    }

    public function test_save_requires_auth(): void
    {
        $response = $this->getJson('/api/saves');
        $response->assertStatus(401);
    }

    public function test_save_validates_territory(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $data = $this->validSaveData();
        $data['territory'] = 'invalid_biome';

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/saves', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['territory']);
    }
}
