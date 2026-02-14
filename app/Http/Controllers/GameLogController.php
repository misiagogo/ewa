<?php

namespace App\Http\Controllers;

use App\Services\GameLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Kontroler logów gry.
 *
 * Endpoint: store (POST /api/logs) — przyjmuje logi z frontendu.
 * Obsługuje pojedyncze logi i batch.
 */
class GameLogController extends Controller
{
    /**
     * @param GameLogService $logService
     */
    public function __construct(
        private readonly GameLogService $logService
    ) {}

    /**
     * Zapisz log(i) z frontendu.
     *
     * Akceptuje pojedynczy log lub tablicę logów (batch).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'logs' => ['sometimes', 'array'],
            'logs.*.level' => ['required_with:logs', 'string', 'in:debug,info,warning,error'],
            'logs.*.category' => ['required_with:logs', 'string', 'max:50'],
            'logs.*.message' => ['required_with:logs', 'string'],
            'logs.*.context' => ['sometimes', 'nullable', 'array'],
            // Pojedynczy log
            'level' => ['required_without:logs', 'string', 'in:debug,info,warning,error'],
            'category' => ['required_without:logs', 'string', 'max:50'],
            'message' => ['required_without:logs', 'string'],
            'context' => ['sometimes', 'nullable', 'array'],
        ]);

        $user = $request->user();

        if ($request->has('logs')) {
            $count = $this->logService->logBatch($request->input('logs'), $user);

            return response()->json([
                'message' => __('game.logs_saved'),
                'count' => $count,
            ]);
        }

        $this->logService->log($request->only(['level', 'category', 'message', 'context']), $user);

        return response()->json([
            'message' => __('game.log_saved'),
        ], 201);
    }
}
