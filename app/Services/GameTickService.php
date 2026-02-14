<?php

namespace App\Services;

use App\Events\PlayerMoved;
use App\Models\GameRoom;
use App\Models\RoomPlayer;
use Illuminate\Support\Facades\Log;

/**
 * GameTickService — logika ticka serwera multiplayer.
 *
 * Aktualizuje stan gry co tick (50ms = 20 ticków/s).
 * Broadcastuje pozycje graczy do kanałów pokoi.
 */
class GameTickService
{
    /** @var int Numer aktualnego ticka */
    protected int $tick = 0;

    /**
     * Wykonaj jeden tick serwera.
     *
     * Iteruje po aktywnych pokojach i broadcastuje stan graczy.
     *
     * @return int Liczba przetworzonych pokoi
     */
    public function tick(): int
    {
        $this->tick++;

        $rooms = GameRoom::where('status', 'playing')
            ->with('players')
            ->get();

        $processedCount = 0;

        foreach ($rooms as $room) {
            $this->processRoom($room);
            $processedCount++;
        }

        return $processedCount;
    }

    /**
     * Przetwórz jeden pokój — broadcastuj pozycje graczy.
     *
     * @param GameRoom $room
     */
    protected function processRoom(GameRoom $room): void
    {
        foreach ($room->players as $player) {
            broadcast(new PlayerMoved(
                roomId: $room->id,
                userId: $player->user_id,
                x: (float) $player->position_x,
                y: (float) $player->position_y,
                z: (float) $player->position_z,
                rotationY: (float) $player->rotation_y,
                tick: $this->tick,
            ))->toOthers();
        }
    }

    /**
     * Pobierz aktualny numer ticka.
     *
     * @return int
     */
    public function getCurrentTick(): int
    {
        return $this->tick;
    }
}
