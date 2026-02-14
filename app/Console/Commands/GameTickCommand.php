<?php

namespace App\Console\Commands;

use App\Services\GameTickService;
use Illuminate\Console\Command;

/**
 * GameTickCommand — artisan command uruchamiający server-side game loop.
 *
 * Tick rate: 20/s (co 50ms). Uruchamiany jako długo-działający proces.
 * Użycie: php artisan game:tick
 */
class GameTickCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'game:tick';

    /**
     * @var string
     */
    protected $description = 'Run the server-side game tick loop (20 ticks/s)';

    /**
     * @param GameTickService $tickService
     * @return int
     */
    public function handle(GameTickService $tickService): int
    {
        $tickRate = (int) config('game.tick_rate', 20);
        $tickInterval = (int) (1000000 / $tickRate); // mikrosekundy

        $this->info("Game tick loop started ({$tickRate} ticks/s)");

        while (true) {
            $start = hrtime(true);

            $roomsProcessed = $tickService->tick();

            $elapsed = (hrtime(true) - $start) / 1000; // mikrosekundy
            $remaining = $tickInterval - (int) $elapsed;

            if ($remaining > 0) {
                usleep($remaining);
            }
        }

        return Command::SUCCESS;
    }
}
