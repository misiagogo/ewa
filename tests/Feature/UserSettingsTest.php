<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy endpointów ustawień użytkownika.
 */
class UserSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function authenticatedUser(): array
    {
        $user = User::factory()->create();
        UserSetting::create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $token];
    }

    public function test_user_can_get_settings(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/settings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'language',
                    'graphics_quality',
                    'view_distance',
                    'sound_volume',
                    'autosave_enabled',
                    'autosave_interval',
                ],
            ]);
    }

    public function test_user_can_update_language(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/settings', ['language' => 'en']);

        $response->assertStatus(200)
            ->assertJson(['data' => ['language' => 'en']]);

        $this->assertDatabaseHas('user_settings', [
            'user_id' => $user->id,
            'language' => 'en',
        ]);
    }

    public function test_user_can_update_multiple_settings(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/settings', [
                'graphics_quality' => 'high',
                'sound_volume' => 50,
                'view_distance' => 8,
                'autosave_enabled' => false,
            ]);

        $response->assertStatus(200)
            ->assertJson(['data' => [
                'graphics_quality' => 'high',
                'sound_volume' => 50,
                'view_distance' => 8,
                'autosave_enabled' => false,
            ]]);
    }

    public function test_settings_validates_invalid_language(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/settings', ['language' => 'fr']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['language']);
    }

    public function test_settings_validates_volume_range(): void
    {
        [$user, $token] = $this->authenticatedUser();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/settings', ['sound_volume' => 150]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sound_volume']);
    }

    public function test_settings_requires_auth(): void
    {
        $response = $this->getJson('/api/settings');
        $response->assertStatus(401);
    }

    public function test_default_settings_created_if_missing(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        // Brak UserSetting — powinno się utworzyć automatycznie
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/settings');

        $response->assertStatus(200)
            ->assertJson(['data' => ['language' => 'pl']]);

        $this->assertDatabaseHas('user_settings', [
            'user_id' => $user->id,
        ]);
    }
}
