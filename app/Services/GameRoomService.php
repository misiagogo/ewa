<?php

namespace App\Services;

use App\Models\GameRoom;
use App\Models\RoomPlayer;
use App\Models\User;
use App\Models\WorldSeed;
use Illuminate\Support\Facades\Hash;

/**
 * Serwis logiki biznesowej pokoi multiplayer.
 *
 * Obsługuje tworzenie, dołączanie, opuszczanie i zamykanie pokoi.
 * Generuje seed świata przy tworzeniu pokoju.
 */
class GameRoomService
{
    /**
     * Lista publicznych aktywnych pokoi.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function listPublic()
    {
        return GameRoom::public()
            ->active()
            ->withCount('players')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Utwórz nowy pokój.
     *
     * @param User $user
     * @param array $data
     * @return GameRoom
     */
    public function create(User $user, array $data): GameRoom
    {
        $seed = random_int(100000, 99999999);

        // Zapisz seed świata
        WorldSeed::create([
            'seed' => $seed,
            'territory' => $data['territory'],
            'created_by' => $user->id,
        ]);

        $room = GameRoom::create([
            'name' => $data['name'],
            'host_user_id' => $user->id,
            'territory' => $data['territory'],
            'world_seed' => $seed,
            'max_players' => $data['max_players'] ?? config('game.max_players_per_room'),
            'is_public' => $data['is_public'] ?? true,
            'password' => isset($data['password']) ? Hash::make($data['password']) : null,
        ]);

        // Host automatycznie dołącza do pokoju
        $this->addPlayer($room, $user, $data['cat_config']);

        return $room->load('players.user');
    }

    /**
     * Dołącz gracza do pokoju.
     *
     * @param GameRoom $room
     * @param User $user
     * @param array $catConfig
     * @return RoomPlayer
     *
     * @throws \RuntimeException
     */
    public function join(GameRoom $room, User $user, array $catConfig): RoomPlayer
    {
        if ($room->isFull()) {
            throw new \RuntimeException(__('game.room_full'));
        }

        if ($room->status === 'closed') {
            throw new \RuntimeException(__('game.room_closed'));
        }

        // Sprawdź czy gracz już jest w pokoju
        $existing = RoomPlayer::where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            throw new \RuntimeException(__('game.already_in_room'));
        }

        return $this->addPlayer($room, $user, $catConfig);
    }

    /**
     * Opuść pokój.
     *
     * @param GameRoom $room
     * @param User $user
     * @return void
     */
    public function leave(GameRoom $room, User $user): void
    {
        RoomPlayer::where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->delete();

        // Jeśli host opuścił pokój — zamknij pokój
        if ($room->host_user_id === $user->id) {
            $room->update(['status' => 'closed']);
        }
    }

    /**
     * Zamknij pokój (tylko host).
     *
     * @param GameRoom $room
     * @param User $user
     * @return void
     *
     * @throws \RuntimeException
     */
    public function close(GameRoom $room, User $user): void
    {
        if ($room->host_user_id !== $user->id) {
            throw new \RuntimeException(__('game.not_host'));
        }

        $room->players()->delete();
        $room->update(['status' => 'closed']);
    }

    /**
     * Dodaj gracza do pokoju (wewnętrzna metoda).
     *
     * @param GameRoom $room
     * @param User $user
     * @param array $catConfig
     * @return RoomPlayer
     */
    private function addPlayer(GameRoom $room, User $user, array $catConfig): RoomPlayer
    {
        return RoomPlayer::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'cat_config' => $catConfig,
        ]);
    }
}
