<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: gracz się poruszył.
 *
 * Broadcastowany na kanale pokoju. Minimalne dane: pozycja + rotacja.
 */
class PlayerMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param int $roomId
     * @param int $userId
     * @param float $x
     * @param float $y
     * @param float $z
     * @param float $rotationY
     * @param int $tick Numer ticka serwera
     */
    public function __construct(
        public int $roomId,
        public int $userId,
        public float $x,
        public float $y,
        public float $z,
        public float $rotationY,
        public int $tick,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('room.' . $this->roomId),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'x' => $this->x,
            'y' => $this->y,
            'z' => $this->z,
            'rotation_y' => $this->rotationY,
            'tick' => $this->tick,
        ];
    }
}
