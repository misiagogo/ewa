<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model seed'a świata.
 *
 * Przechowuje seed Perlin Noise i biom bazowy dla generowania terenu.
 * Ten sam seed = ten sam świat (deterministyczne generowanie).
 *
 * @property int $id
 * @property int $seed
 * @property string $territory
 * @property array|null $metadata
 * @property int $created_by
 */
class WorldSeed extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'seed',
        'territory',
        'metadata',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'seed' => 'integer',
            'metadata' => 'array',
        ];
    }

    /**
     * Twórca seed'a.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
