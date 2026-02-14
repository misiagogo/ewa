<?php

namespace Tests\Feature;

use App\Models\GameRoom;
use App\Models\RoomPlayer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy endpointów pokoi multiplayer.
 */
class GameRoomTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Pomocnicza: dane poprawnego cat_config.
     */
    private function validCatConfig(): array
    {
        return [
            'name' => 'Mruczek',
            'fur_color' => '#ff8800',
            'pattern' => 'striped',
            'eye_color' => '#00ff00',
            'age' => 'adult',
            'gender' => 'male',
        ];
    }

    /**
     * Pomocnicza: zalogowany użytkownik z tokenem.
     */
    private function authenticatedUser(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $token];
    }

    public function test_user_can_create_room(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/rooms', [
                'name' => 'Test Room',
                'territory' => 'pine_forest',
                'cat_config' => $this->validCatConfig(),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'host_user_id', 'territory', 'world_seed', 'status', 'players'],
            ]);

        $this->assertDatabaseHas('game_rooms', [
            'name' => 'Test Room',
            'host_user_id' => $user->id,
            'status' => 'waiting',
        ]);

        // Host powinien być automatycznie dodany jako gracz
        $this->assertDatabaseHas('room_players', [
            'user_id' => $user->id,
        ]);
    }

    public function test_user_can_list_public_rooms(): void
    {
        GameRoom::factory()->count(3)->create(['is_public' => true, 'status' => 'waiting']);
        GameRoom::factory()->create(['is_public' => false, 'status' => 'waiting']);
        GameRoom::factory()->create(['is_public' => true, 'status' => 'closed']);

        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/rooms');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_join_room(): void
    {
        [$host, $hostToken] = $this->authenticatedUser();
        [$player, $playerToken] = $this->authenticatedUser();

        $room = GameRoom::factory()->create([
            'host_user_id' => $host->id,
            'status' => 'waiting',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $playerToken)
            ->postJson('/api/rooms/' . $room->id . '/join', [
                'cat_config' => $this->validCatConfig(),
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => __('game.room_joined')]);

        $this->assertDatabaseHas('room_players', [
            'room_id' => $room->id,
            'user_id' => $player->id,
        ]);
    }

    public function test_user_cannot_join_full_room(): void
    {
        [$host, $hostToken] = $this->authenticatedUser();

        $room = GameRoom::factory()->create([
            'host_user_id' => $host->id,
            'max_players' => 1,
        ]);

        // Dodaj jednego gracza (max)
        RoomPlayer::create([
            'room_id' => $room->id,
            'user_id' => $host->id,
            'cat_config' => $this->validCatConfig(),
        ]);

        [$player, $playerToken] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $playerToken)
            ->postJson('/api/rooms/' . $room->id . '/join', [
                'cat_config' => $this->validCatConfig(),
            ]);

        $response->assertStatus(422);
    }

    public function test_user_can_leave_room(): void
    {
        [$host, $hostToken] = $this->authenticatedUser();
        [$player, $playerToken] = $this->authenticatedUser();

        $room = GameRoom::factory()->create(['host_user_id' => $host->id]);

        RoomPlayer::create([
            'room_id' => $room->id,
            'user_id' => $player->id,
            'cat_config' => $this->validCatConfig(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $playerToken)
            ->postJson('/api/rooms/' . $room->id . '/leave');

        $response->assertStatus(200);

        $this->assertDatabaseMissing('room_players', [
            'room_id' => $room->id,
            'user_id' => $player->id,
        ]);
    }

    public function test_host_leaving_closes_room(): void
    {
        [$host, $hostToken] = $this->authenticatedUser();

        $room = GameRoom::factory()->create(['host_user_id' => $host->id]);

        RoomPlayer::create([
            'room_id' => $room->id,
            'user_id' => $host->id,
            'cat_config' => $this->validCatConfig(),
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $hostToken)
            ->postJson('/api/rooms/' . $room->id . '/leave');

        $this->assertDatabaseHas('game_rooms', [
            'id' => $room->id,
            'status' => 'closed',
        ]);
    }

    public function test_host_can_destroy_room(): void
    {
        [$host, $hostToken] = $this->authenticatedUser();

        $room = GameRoom::factory()->create(['host_user_id' => $host->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $hostToken)
            ->deleteJson('/api/rooms/' . $room->id);

        $response->assertStatus(200);

        $this->assertDatabaseHas('game_rooms', [
            'id' => $room->id,
            'status' => 'closed',
        ]);
    }

    public function test_non_host_cannot_destroy_room(): void
    {
        [$host, $hostToken] = $this->authenticatedUser();
        [$player, $playerToken] = $this->authenticatedUser();

        $room = GameRoom::factory()->create(['host_user_id' => $host->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $playerToken)
            ->deleteJson('/api/rooms/' . $room->id);

        $response->assertStatus(403);
    }

    public function test_rooms_require_auth(): void
    {
        $response = $this->getJson('/api/rooms');
        $response->assertStatus(401);
    }
}
