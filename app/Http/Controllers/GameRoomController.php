<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateRoomRequest;
use App\Http\Requests\JoinRoomRequest;
use App\Http\Resources\GameRoomResource;
use App\Models\GameRoom;
use App\Services\GameRoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Kontroler pokoi multiplayer.
 *
 * Endpointy: index, store, show, join, leave, destroy.
 * Logika biznesowa delegowana do GameRoomService.
 */
class GameRoomController extends Controller
{
    /**
     * @param GameRoomService $roomService
     */
    public function __construct(
        private readonly GameRoomService $roomService
    ) {}

    /**
     * Lista publicznych aktywnych pokoi.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        $rooms = $this->roomService->listPublic();

        return GameRoomResource::collection($rooms);
    }

    /**
     * Utwórz nowy pokój.
     *
     * @param CreateRoomRequest $request
     * @return JsonResponse
     */
    public function store(CreateRoomRequest $request): JsonResponse
    {
        $room = $this->roomService->create(
            $request->user(),
            $request->validated()
        );

        return (new GameRoomResource($room))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Szczegóły pokoju.
     *
     * @param int $id
     * @return GameRoomResource
     */
    public function show(int $id): GameRoomResource
    {
        $room = GameRoom::with('players.user')->findOrFail($id);

        return new GameRoomResource($room);
    }

    /**
     * Dołącz do pokoju.
     *
     * @param JoinRoomRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function join(JoinRoomRequest $request, int $id): JsonResponse
    {
        $room = GameRoom::findOrFail($id);

        // Weryfikacja hasła dla prywatnych pokoi
        if ($room->password && !Hash::check($request->input('password', ''), $room->password)) {
            return response()->json([
                'message' => __('game.room_wrong_password'),
            ], 403);
        }

        try {
            $this->roomService->join($room, $request->user(), $request->validated('cat_config'));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => __('game.room_joined'),
            'room' => new GameRoomResource($room->load('players.user')),
        ]);
    }

    /**
     * Opuść pokój.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function leave(Request $request, int $id): JsonResponse
    {
        $room = GameRoom::findOrFail($id);

        $this->roomService->leave($room, $request->user());

        return response()->json([
            'message' => __('game.room_left'),
        ]);
    }

    /**
     * Zamknij pokój (tylko host).
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $room = GameRoom::findOrFail($id);

        try {
            $this->roomService->close($room, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }

        return response()->json([
            'message' => __('game.room_closed'),
        ]);
    }
}
