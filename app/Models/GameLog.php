<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model logu gry.
 *
 * Przechowuje logi z frontendu i backendu: auth, save, gameplay, network.
 * Poziomy: debug, info, warning, error.
 *
 * @property int $id
 * @property int|null $user_id
 * @property int|null $room_id
 * @property string $level
 * @property string $category
 * @property string $message
 * @property array|null $context
 * @property \Carbon\Carbon $created_at
 */
class GameLog extends Model
{
    /**
     * Tabela nie ma updated_at — tylko created_at.
     */
    const UPDATED_AT = null;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'room_id',
        'level',
        'category',
        'message',
        'context',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'context' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Użytkownik powiązany z logiem.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: logi konkretnego użytkownika.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: logi o danym poziomie.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $level
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLevel($query, string $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope: logi z danej kategorii.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $category
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
