<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testy rejestracji użytkownika.
 *
 * Pokrywa: happy path, duplikat email/name, walidacja hasła.
 */
class RegisterTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Poprawna rejestracja zwraca 201 + token.
     */
    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'TestCat',
            'email' => 'cat@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'cat@test.com',
            'name' => 'TestCat',
        ]);

        // Domyślne ustawienia powinny być utworzone
        $this->assertDatabaseHas('user_settings', [
            'user_id' => $response->json('user.id'),
            'language' => 'pl',
        ]);
    }

    /**
     * Rejestracja z duplikatem email zwraca 422.
     */
    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'cat@test.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'TestCat2',
            'email' => 'cat@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Rejestracja z duplikatem nazwy zwraca 422.
     */
    public function test_register_fails_with_duplicate_name(): void
    {
        User::factory()->create(['name' => 'TestCat']);

        $response = $this->postJson('/api/register', [
            'name' => 'TestCat',
            'email' => 'unique@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Rejestracja bez potwierdzenia hasła zwraca 422.
     */
    public function test_register_fails_without_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'TestCat',
            'email' => 'cat@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Rejestracja z za krótkim hasłem zwraca 422.
     */
    public function test_register_fails_with_short_password(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'TestCat',
            'email' => 'cat@test.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
