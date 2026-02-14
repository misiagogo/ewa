<?php

namespace App\Services;

use App\Models\GameLog;
use App\Models\User;

/**
 * Serwis logowania zdarzeń gry.
 *
 * Zapisuje logi z frontendu i backendu do tabeli game_logs.
 * Poziomy: debug, info, warning, error.
 * Kategorie: auth, save, gameplay, network.
 */
class GameLogService
{
    /**
     * Zapisz log gry.
     *
     * @param array $data Dane logu (level, category, message, context)
     * @param User|null $user Użytkownik (opcjonalny)
     * @param int|null $roomId ID pokoju (opcjonalny, kontekst multiplayer)
     * @return GameLog
     */
    public function log(array $data, ?User $user = null, ?int $roomId = null): GameLog
    {
        return GameLog::create([
            'user_id' => $user?->id,
            'room_id' => $roomId,
            'level' => $data['level'] ?? 'info',
            'category' => $data['category'] ?? 'general',
            'message' => $data['message'],
            'context' => $data['context'] ?? null,
        ]);
    }

    /**
     * Zapisz batch logów (z frontendu).
     *
     * @param array $logs Tablica logów
     * @param User|null $user
     * @return int Liczba zapisanych logów
     */
    public function logBatch(array $logs, ?User $user = null): int
    {
        $count = 0;

        foreach ($logs as $logData) {
            $this->log($logData, $user);
            $count++;
        }

        return $count;
    }
}
