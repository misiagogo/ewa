<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model pokoju gry multiplayer.
 *
 * Pokój ma hosta, terytorium, seed świata i listę graczy.
 * Statusy: waiting (lobby), playing (gra), closed (zamknięty).
 *
 * @property int $id
 * @property string $name
 * @property int $host_user_id
 * @property string $territory
 * @property int $world_seed
 * @property int $max_players
 * @property string $status
 * @property bool $is_public
 * @property string|null $password
 */
class GameRoom extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'host_user_id',
        'territory',
        'world_seed',
        'max_players',
        'status',
        'is_public',
        'password',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'world_seed' => 'integer',
            'max_players' => 'integer',
            'is_public' => 'boolean',
        ];
    }

    /**
     * Host pokoju.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function host()
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    /**
     * Gracze w pokoju (pivot).
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function players()
    {
        return $this->hasMany(RoomPlayer::class, 'room_id');
    }

    /**
     * Użytkownicy w pokoju (through pivot).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'room_players', 'room_id', 'user_id')
            ->withPivot(['cat_config', 'position_x', 'position_y', 'position_z', 'rotation_y', 'joined_at']);
    }

    /**
     * Scope: publiczne pokoje.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope: aktywne pokoje (waiting lub playing).
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['waiting', 'playing']);
    }

    /**
     * Czy pokój jest pełny.
     *
     * @return bool
     */
    public function isFull(): bool
    {
        return $this->players()->count() >= $this->max_players;
    }
}
