<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model ustawień użytkownika.
 *
 * Przechowuje preferencje gry: język, jakość grafiki, głośność, autosave.
 * Jeden rekord per użytkownik (relacja 1:1).
 *
 * @property int $id
 * @property int $user_id
 * @property string $language
 * @property string $graphics_quality
 * @property int $view_distance
 * @property int $sound_volume
 * @property bool $autosave_enabled
 * @property int $autosave_interval
 */
class UserSetting extends Model
{
    /**
     * Domyślne wartości atrybutów.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'language' => 'pl',
        'graphics_quality' => 'medium',
        'view_distance' => 5,
        'sound_volume' => 80,
        'autosave_enabled' => true,
        'autosave_interval' => 60,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'language',
        'graphics_quality',
        'view_distance',
        'sound_volume',
        'autosave_enabled',
        'autosave_interval',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'view_distance' => 'integer',
            'sound_volume' => 'integer',
            'autosave_enabled' => 'boolean',
            'autosave_interval' => 'integer',
        ];
    }

    /**
     * Właściciel ustawień.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
