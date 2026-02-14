/**
 * TerrainGenerator — generuje heightmap i mesh terenu per chunk.
 *
 * Deterministyczne: seed + chunkX + chunkZ = ten sam teren.
 * Używa SeededNoise (Perlin) z fbm2D.
 */

import WorldConfig from '../world/world-config.js';
import SeededNoise from '../utils/noise.js';

class TerrainGenerator {
    /** @type {SeededNoise} */
    _noise;

    /** @type {Object} Biom config */
    _biome;

    /** @type {Object|null} Three.js module */
    _THREE = null;

    /** @type {Map<number, Object>} Cache materiałów per biom color */
    _materialCache = new Map();

    /**
     * @param {number} seed - Seed świata
     * @param {string} territory - Nazwa terytorium/biomu
     * @param {Object} THREE - Three.js module
     */
    constructor(seed, territory, THREE) {
        this._noise = new SeededNoise(seed);
        this._biome = WorldConfig.BIOMES[territory] || WorldConfig.BIOMES.pine_forest;
        this._THREE = THREE;
    }

    /**
     * Generuj mesh terenu dla chunka.
     *
     * @param {number} chunkX - Współrzędna chunka X
     * @param {number} chunkZ - Współrzędna chunka Z
     * @param {number} [segments=32] - Rozdzielczość geometrii (LOD)
     * @returns {Object} Three.js Mesh
     */
    createTerrainMesh(chunkX, chunkZ, segments = 32) {
        const THREE = this._THREE;
        const size = WorldConfig.CHUNK_SIZE;

        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position;
        const worldOffsetX = chunkX * size;
        const worldOffsetZ = chunkZ * size;

        for (let i = 0; i < positions.count; i++) {
            const localX = positions.getX(i);
            const localZ = positions.getZ(i);

            const worldX = worldOffsetX + localX;
            const worldZ = worldOffsetZ + localZ;

            const height = this.getHeight(worldX, worldZ);
            positions.setY(i, height);
        }

        geometry.computeVertexNormals();

        const material = this._getMaterial(this._biome.groundColor);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            worldOffsetX,
            0,
            worldOffsetZ
        );
        mesh.userData = { type: 'terrain', chunkX, chunkZ };

        return mesh;
    }

    /**
     * Oblicz wysokość terenu w punkcie world space.
     *
     * @param {number} worldX
     * @param {number} worldZ
     * @returns {number}
     */
    getHeight(worldX, worldZ) {
        const value = this._noise.fbm2D(
            worldX,
            worldZ,
            WorldConfig.NOISE_OCTAVES,
            WorldConfig.NOISE_PERSISTENCE,
            WorldConfig.NOISE_LACUNARITY,
            WorldConfig.NOISE_SCALE
        );

        return value * WorldConfig.MAX_HEIGHT * this._biome.heightMultiplier;
    }

    /**
     * Pobierz lub utwórz materiał (cache).
     *
     * @param {number} color
     * @returns {Object} Three.js Material
     * @private
     */
    _getMaterial(color) {
        if (this._materialCache.has(color)) {
            return this._materialCache.get(color);
        }
        const mat = new this._THREE.MeshLambertMaterial({ color });
        this._materialCache.set(color, mat);
        return mat;
    }
}

export default TerrainGenerator;
