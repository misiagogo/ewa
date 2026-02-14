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
    MAX_DECORATIONS_PER_CHUNK: 50,

    /** Rozmiar puli chunków (object pooling) */
    CHUNK_POOL_SIZE: 64,

    /** Definicje biomów per terytorium */
    BIOMES: {
        pine_forest: {
            groundColor: 0x2d5a27,
            treeColor: 0x1a4a1a,
            trunkColor: 0x5c3a1e,
            grassColor: 0x2a6a22,
            bushColor: 0x1a5a1a,
            flowerColors: [0xff4466, 0xeedd33, 0xaa66ff],
            treeChance: 0.22,
            rockChance: 0.04,
            grassChance: 0.30,
            flowerChance: 0.06,
            bushChance: 0.08,
            heightMultiplier: 1.0,
        },
        deciduous_forest: {
            groundColor: 0x4a7c3f,
            treeColor: 0x3a8a2a,
            trunkColor: 0x6b4226,
            grassColor: 0x3a7a2a,
            bushColor: 0x2a6a1a,
            flowerColors: [0xff4466, 0xffaa22, 0xeedd33, 0xaa66ff, 0xff88cc],
            treeChance: 0.18,
            rockChance: 0.02,
            grassChance: 0.32,
            flowerChance: 0.10,
            bushChance: 0.10,
            heightMultiplier: 0.8,
        },
        desert: {
            groundColor: 0xc2a645,
            treeColor: 0x5a8a3a,
            trunkColor: 0x8a7a5a,
            grassColor: 0x8a9a3a,
            bushColor: 0x6a7a2a,
            flowerColors: [0xffaa22, 0xeedd33],
            treeChance: 0.02,
            rockChance: 0.08,
            grassChance: 0.06,
            flowerChance: 0.02,
            bushChance: 0.02,
            heightMultiplier: 0.5,
        },
        mountains: {
            groundColor: 0x6b6b6b,
            treeColor: 0x2a5a2a,
            trunkColor: 0x4a3a2a,
            grassColor: 0x4a6a3a,
            bushColor: 0x3a5a2a,
            flowerColors: [0xeedd33, 0xaa66ff],
            treeChance: 0.08,
            rockChance: 0.15,
            grassChance: 0.18,
            flowerChance: 0.03,
            bushChance: 0.04,
            heightMultiplier: 2.0,
        },
        swamp: {
            groundColor: 0x3a5a3a,
            treeColor: 0x2a4a2a,
            trunkColor: 0x3a2a1a,
            grassColor: 0x2a5a2a,
            bushColor: 0x1a4a1a,
            flowerColors: [0xaa66ff, 0x66aaff, 0xff88cc],
            treeChance: 0.12,
            rockChance: 0.02,
            grassChance: 0.35,
            flowerChance: 0.05,
            bushChance: 0.12,
            heightMultiplier: 0.3,
        },
    },
};

export default WorldConfig;
