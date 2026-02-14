<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy logowania i wylogowania użytkownika.
 *
 * Pokrywa: happy path login/logout, złe dane, dostęp do /user.
 */
class LoginTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Poprawne logowanie zwraca 200 + token.
     */
    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'cat@test.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'cat@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email'],
                'token',
            ]);
    }

    /**
     * Logowanie ze złym hasłem zwraca 401.
     */
    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'cat@test.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'cat@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => __('auth.failed')]);
    }

    /**
     * Logowanie z nieistniejącym emailem zwraca 401.
     */
    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nobody@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Logowanie aktualizuje last_login_at.
     */
    public function test_login_updates_last_login_at(): void
    {
        $user = User::factory()->create([
            'email' => 'cat@test.com',
            'password' => bcrypt('password123'),
        ]);

        $this->assertNull($user->last_login_at);

        $this->postJson('/api/login', [
            'email' => 'cat@test.com',
            'password' => 'password123',
        ]);

        $user->refresh();
        $this->assertNotNull($user->last_login_at);
    }

    /**
     * Wylogowanie usuwa token i zwraca 200.
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('cat-survival')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => __('auth.logged_out')]);

        // Token powinien być usunięty
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    /**
     * Endpoint /user zwraca dane zalogowanego użytkownika.
     */
    public function test_user_endpoint_returns_authenticated_user(): void
    {
        $user = User::factory()->create([
            'name' => 'TestCat',
            'email' => 'cat@test.com',
        ]);
        $token = $user->createToken('cat-survival')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'name' => 'TestCat',
                    'email' => 'cat@test.com',
                ],
            ]);
    }

    /**
     * Endpoint /user bez tokenu zwraca 401.
     */
    public function test_user_endpoint_requires_auth(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }
}
