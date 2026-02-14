/**
 * ChunkLoader — tworzy kompletne chunki (teren + dekoracje).
 *
 * Łączy TerrainGenerator i DecorationGenerator.
 * Obsługuje LOD rebuild per chunk.
 */

import WorldConfig from './world-config.js';
import TerrainGenerator from '../generators/terrain-generator.js';
import DecorationGenerator from '../generators/decoration-generator.js';
import LodManager from './lod-manager.js';

class ChunkLoader {
    /** @type {TerrainGenerator} */
    _terrainGen;

    /** @type {DecorationGenerator} */
    _decoGen;

    /** @type {Object} Three.js module */
    _THREE;

    /**
     * @param {number} seed - Seed świata
     * @param {string} territory - Nazwa terytorium
     * @param {Object} THREE - Three.js module
     */
    constructor(seed, territory, THREE) {
        this._THREE = THREE;
        this._terrainGen = new TerrainGenerator(seed, territory, THREE);
        this._decoGen = new DecorationGenerator(
            seed,
            territory,
            THREE,
            (wx, wz) => this._terrainGen.getHeight(wx, wz)
        );
    }

    /**
     * Utwórz kompletny chunk (teren + dekoracje + LOD rebuild fn).
     *
     * @param {number} chunkX
     * @param {number} chunkZ
     * @returns {Object} { mesh, decorations, currentSegments, rebuildFn }
     */
    createChunk(chunkX, chunkZ) {
        const segments = WorldConfig.LOD_LEVELS[0].segments;
        const mesh = this._terrainGen.createTerrainMesh(chunkX, chunkZ, segments);
        const decorations = this._decoGen.createDecorations(chunkX, chunkZ);

        const chunkData = {
            mesh,
            decorations,
            currentSegments: segments,
            rebuildFn: (newSegments) => {
                this._rebuildTerrain(chunkData, chunkX, chunkZ, newSegments);
            },
        };

        return chunkData;
    }

    /**
     * Przebuduj geometrię terenu z nowym LOD.
     *
     * @param {Object} chunkData
     * @param {number} chunkX
     * @param {number} chunkZ
     * @param {number} segments
     * @private
     */
    _rebuildTerrain(chunkData, chunkX, chunkZ, segments) {
        if (!chunkData.mesh) return;

        const oldGeo = chunkData.mesh.geometry;
        const newMesh = this._terrainGen.createTerrainMesh(chunkX, chunkZ, segments);

        chunkData.mesh.geometry = newMesh.geometry;
        chunkData.mesh.geometry.computeVertexNormals();

        if (oldGeo) oldGeo.dispose();
        newMesh.geometry = null;
    }
}

export default ChunkLoader;
