<?php

namespace App\Services;

use App\Models\GameSave;
use App\Models\User;

/**
 * Serwis logiki biznesowej save'ów gry.
 *
 * Obsługuje CRUD save'ów, autosave (upsert slot=0),
 * walidację limitu slotów i wersjonowanie formatu.
 */
class GameSaveService
{
    /**
     * Pobierz wszystkie save'y użytkownika.
     *
     * @param User $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllForUser(User $user)
    {
        return $user->gameSaves()->orderBy('slot')->get();
    }

    /**
     * Pobierz konkretny save użytkownika.
     *
     * @param User $user
     * @param int $saveId
     * @return GameSave
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getForUser(User $user, int $saveId): GameSave
    {
        return $user->gameSaves()->findOrFail($saveId);
    }

    /**
     * Utwórz nowy save.
     *
     * @param User $user
     * @param array $data
     * @return GameSave
     */
    public function create(User $user, array $data): GameSave
    {
        return $user->gameSaves()->create([
            'slot' => $data['slot'],
            'name' => $data['name'] ?? null,
            'territory' => $data['territory'],
            'cat_config' => $data['cat_config'],
            'game_state' => $data['game_state'],
            'version' => config('game.save_version'),
        ]);
    }

    /**
     * Aktualizuj istniejący save.
     *
     * @param User $user
     * @param int $saveId
     * @param array $data
     * @return GameSave
     */
    public function update(User $user, int $saveId, array $data): GameSave
    {
        $save = $user->gameSaves()->findOrFail($saveId);

        $save->update([
            'name' => $data['name'] ?? $save->name,
            'territory' => $data['territory'] ?? $save->territory,
            'cat_config' => $data['cat_config'] ?? $save->cat_config,
            'game_state' => $data['game_state'] ?? $save->game_state,
        ]);

        return $save->fresh();
    }

    /**
     * Usuń save.
     *
     * @param User $user
     * @param int $saveId
     * @return void
     */
    public function delete(User $user, int $saveId): void
    {
        $save = $user->gameSaves()->findOrFail($saveId);
        $save->delete();
    }

    /**
     * Autosave — upsert slot=0 dla użytkownika.
     *
     * @param User $user
     * @param array $data
     * @return GameSave
     */
    public function autosave(User $user, array $data): GameSave
    {
        return GameSave::updateOrCreate(
            [
                'user_id' => $user->id,
                'slot' => 0,
            ],
            [
                'name' => $data['name'] ?? 'Autosave',
                'territory' => $data['territory'],
                'cat_config' => $data['cat_config'],
                'game_state' => $data['game_state'],
                'version' => config('game.save_version'),
            ]
        );
    }
}
