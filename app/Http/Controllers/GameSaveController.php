<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveGameRequest;
use App\Http\Resources\GameSaveResource;
use App\Services\GameSaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Kontroler CRUD save'ów gry.
 *
 * Endpointy: index, show, store, update, destroy, autosave.
 * Logika biznesowa delegowana do GameSaveService.
 */
class GameSaveController extends Controller
{
    /**
     * @param GameSaveService $saveService
     */
    public function __construct(
        private readonly GameSaveService $saveService
    ) {}

    /**
     * Lista save'ów zalogowanego użytkownika.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $saves = $this->saveService->getAllForUser($request->user());

        return GameSaveResource::collection($saves);
    }

    /**
     * Szczegóły konkretnego save'a.
     *
     * @param Request $request
     * @param int $id
     * @return GameSaveResource
     */
    public function show(Request $request, int $id): GameSaveResource
    {
        $save = $this->saveService->getForUser($request->user(), $id);

        return new GameSaveResource($save);
    }

    /**
     * Utworzenie nowego save'a.
     *
     * @param SaveGameRequest $request
     * @return JsonResponse
     */
    public function store(SaveGameRequest $request): JsonResponse
    {
        $save = $this->saveService->create(
            $request->user(),
            $request->validated()
        );

        return (new GameSaveResource($save))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Aktualizacja istniejącego save'a.
     *
     * @param SaveGameRequest $request
     * @param int $id
     * @return GameSaveResource
     */
    public function update(SaveGameRequest $request, int $id): GameSaveResource
    {
        $save = $this->saveService->update(
            $request->user(),
            $id,
            $request->validated()
        );

        return new GameSaveResource($save);
    }

    /**
     * Usunięcie save'a.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->saveService->delete($request->user(), $id);

        return response()->json([
            'message' => __('game.save_deleted'),
        ]);
    }

    /**
     * Autosave — upsert slot=0.
     *
     * @param SaveGameRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function autosave(SaveGameRequest $request)
    {
        $save = $this->saveService->autosave(
            $request->user(),
            $request->validated()
        );

        return (new GameSaveResource($save))
            ->response()
            ->setStatusCode(200);
    }
}
