<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model gracza w pokoju (pivot table z dodatkowymi danymi).
 *
 * Przechowuje konfigurację kota gracza i jego ostatnią pozycję w pokoju.
 *
 * @property int $id
 * @property int $room_id
 * @property int $user_id
 * @property array $cat_config
 * @property float $position_x
 * @property float $position_y
 * @property float $position_z
 * @property float $rotation_y
 * @property \Carbon\Carbon $joined_at
 */
class RoomPlayer extends Model
{
    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'room_id',
        'user_id',
        'cat_config',
        'position_x',
        'position_y',
        'position_z',
        'rotation_y',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cat_config' => 'array',
            'position_x' => 'float',
            'position_y' => 'float',
            'position_z' => 'float',
            'rotation_y' => 'float',
            'joined_at' => 'datetime',
        ];
    }

    /**
     * Pokój, do którego należy gracz.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function room()
    {
        return $this->belongsTo(GameRoom::class, 'room_id');
    }

    /**
     * Użytkownik (gracz).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
