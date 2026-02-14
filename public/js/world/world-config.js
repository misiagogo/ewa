/**
 * WorldConfig — stałe konfiguracyjne otwartego świata.
 *
 * Nigdy nie hardcoduj wartości chunków — zawsze z tego pliku.
 */

const WorldConfig = {
    /** Rozmiar chunka w jednostkach (kwadrat CHUNK_SIZE x CHUNK_SIZE) */
    CHUNK_SIZE: 32,

    /** Promień ładowania chunków wokół gracza (w chunkach) */
    VIEW_DISTANCE: 5,

    /** Promień usuwania chunków (VIEW_DISTANCE + margines) */
    UNLOAD_DISTANCE: 7,

    /** Maksymalna wysokość terenu */
    MAX_HEIGHT: 8,

    /** Skala szumu Perlin (mniejsza = łagodniejszy teren) */
    NOISE_SCALE: 0.02,

    /** Liczba oktaw szumu Perlin */
    NOISE_OCTAVES: 4,

    /** Persistence szumu (wpływ kolejnych oktaw) */
    NOISE_PERSISTENCE: 0.5,

    /** Lacunarity szumu (częstotliwość kolejnych oktaw) */
    NOISE_LACUNARITY: 2.0,

    /** Poziomy LOD: [odległość w chunkach, rozdzielczość segmentów] */
    LOD_LEVELS: [
        { distance: 2, segments: 32 },
        { distance: 4, segments: 16 },
        { distance: 7, segments: 8 },
    ],

    /** Maksymalna liczba dekoracji per chunk */
    MAX_DECORATIONS_PER_CHUNK: 15,

    /** Rozmiar puli chunków (object pooling) */
    CHUNK_POOL_SIZE: 64,

    /** Definicje biomów per terytorium */
    BIOMES: {
        pine_forest: {
            groundColor: 0x2d5a27,
            treeColor: 0x1a4a1a,
            trunkColor: 0x5c3a1e,
            treeChance: 0.3,
            rockChance: 0.05,
            heightMultiplier: 1.0,
        },
        deciduous_forest: {
            groundColor: 0x4a7c3f,
            treeColor: 0x3a8a2a,
            trunkColor: 0x6b4226,
            treeChance: 0.25,
            rockChance: 0.03,
            heightMultiplier: 0.8,
        },
        desert: {
            groundColor: 0xc2a645,
            treeColor: 0x5a8a3a,
            trunkColor: 0x8a7a5a,
            treeChance: 0.02,
            rockChance: 0.08,
            heightMultiplier: 0.5,
        },
        mountains: {
            groundColor: 0x6b6b6b,
            treeColor: 0x2a5a2a,
            trunkColor: 0x4a3a2a,
            treeChance: 0.1,
            rockChance: 0.2,
            heightMultiplier: 2.0,
        },
        swamp: {
            groundColor: 0x3a5a3a,
            treeColor: 0x2a4a2a,
            trunkColor: 0x3a2a1a,
            treeChance: 0.15,
            rockChance: 0.02,
            heightMultiplier: 0.3,
        },
    },
};

export default WorldConfig;
