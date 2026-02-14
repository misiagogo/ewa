<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model save'a gry.
 *
 * Przechowuje stan gry użytkownika w jednym z 4 slotów (0=autosave, 1-3=ręczne).
 * Zawiera konfigurację kota, terytorium i pełny stan gry w formacie JSON.
 *
 * @property int $id
 * @property int $user_id
 * @property int $slot
 * @property string|null $name
 * @property string $territory
 * @property array $cat_config
 * @property array $game_state
 * @property int $version
 */
class GameSave extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'slot',
        'name',
        'territory',
        'cat_config',
        'game_state',
        'version',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cat_config' => 'array',
            'game_state' => 'array',
            'slot' => 'integer',
            'version' => 'integer',
        ];
    }

    /**
     * Właściciel save'a.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: save'y konkretnego użytkownika.
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
     * Scope: autosave (slot=0).
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAutosave($query)
    {
        return $query->where('slot', 0);
    }
}
