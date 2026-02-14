<?php

use App\Models\GameRoom;
use App\Models\RoomPlayer;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels — autoryzacja kanałów WebSocket
|--------------------------------------------------------------------------
| Kanały presence dla pokoi multiplayer.
| Gracz musi być członkiem pokoju aby nasłuchiwać na kanale.
*/

/**
 * Kanał presence pokoju — autoryzacja gracza.
 *
 * Gracz musi być w tabeli room_players aby mieć dostęp.
 */
Broadcast::channel('room.{roomId}', function ($user, $roomId) {
    $player = RoomPlayer::where('room_id', $roomId)
        ->where('user_id', $user->id)
        ->first();

    if ($player) {
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }

    return false;
});
