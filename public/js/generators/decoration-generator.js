/**
 * DecorationGenerator — generuje dekoracje (drzewa, skały) per chunk per biom.
 *
 * Deterministyczne: seed + chunkX + chunkZ = te same dekoracje.
 * Cache'uje materiały — nigdy nie tworzy nowych per obiekt.
 */

import WorldConfig from '../world/world-config.js';
import SeededNoise from '../utils/noise.js';

class DecorationGenerator {
    /** @type {SeededNoise} */
    _noise;

    /** @type {Object} Biom config */
    _biome;

    /** @type {Object} Three.js module */
    _THREE;

    /** @type {Object} Cached tree material */
    _treeMat = null;

    /** @type {Object} Cached trunk material */
    _trunkMat = null;

    /** @type {Object} Cached rock material */
    _rockMat = null;

    /** @type {Function} Callback do pobierania wysokości terenu */
    _getHeight;

    /**
     * @param {number} seed
     * @param {string} territory
     * @param {Object} THREE
     * @param {Function} getHeight - (worldX, worldZ) => height
     */
    constructor(seed, territory, THREE, getHeight) {
        this._noise = new SeededNoise(seed + 7919);
        this._biome = WorldConfig.BIOMES[territory] || WorldConfig.BIOMES.pine_forest;
        this._THREE = THREE;
        this._getHeight = getHeight;

        this._treeMat = new THREE.MeshLambertMaterial({ color: this._biome.treeColor });
        this._trunkMat = new THREE.MeshLambertMaterial({ color: this._biome.trunkColor });
        this._rockMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    }

    /**
     * Generuj dekoracje dla chunka.
     *
     * @param {number} chunkX
     * @param {number} chunkZ
     * @returns {Array<Object>} Tablica Three.js meshów
     */
    createDecorations(chunkX, chunkZ) {
        const THREE = this._THREE;
        const size = WorldConfig.CHUNK_SIZE;
        const maxDeco = WorldConfig.MAX_DECORATIONS_PER_CHUNK;
        const decorations = [];

        const worldOffsetX = chunkX * size;
        const worldOffsetZ = chunkZ * size;

        // Deterministyczny seed per chunk
        const chunkSeed = Math.abs(chunkX * 73856093 ^ chunkZ * 19349663);
        let rng = chunkSeed;

        const nextRandom = () => {
            rng = (rng * 16807 + 0) % 2147483647;
            return rng / 2147483647;
        };

        for (let i = 0; i < maxDeco; i++) {
            const localX = (nextRandom() - 0.5) * size;
            const localZ = (nextRandom() - 0.5) * size;
            const roll = nextRandom();

            const worldX = worldOffsetX + localX;
            const worldZ = worldOffsetZ + localZ;
            const height = this._getHeight(worldX, worldZ);

            if (roll < this._biome.treeChance) {
                const tree = this._createTree(THREE, worldX, height, worldZ, nextRandom);
                if (tree) decorations.push(tree);
            } else if (roll < this._biome.treeChance + this._biome.rockChance) {
                const rock = this._createRock(THREE, worldX, height, worldZ, nextRandom);
                if (rock) decorations.push(rock);
            }
        }

        return decorations;
    }

    /**
     * Utwórz drzewo (pień + korona).
     *
     * @param {Object} THREE
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {Function} rng
     * @returns {Object} Three.js Group
     * @private
     */
    _createTree(THREE, x, y, z, rng) {
        const group = new THREE.Group();

        const trunkHeight = 1.5 + rng() * 1.5;
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, trunkHeight, 6);
        const trunk = new THREE.Mesh(trunkGeo, this._trunkMat);
        trunk.position.set(0, trunkHeight / 2, 0);
        group.add(trunk);

        const crownRadius = 0.8 + rng() * 0.6;
        const crownGeo = new THREE.SphereGeometry(crownRadius, 6, 6);
        const crown = new THREE.Mesh(crownGeo, this._treeMat);
        crown.position.set(0, trunkHeight + crownRadius * 0.6, 0);
        group.add(crown);

        group.position.set(x, y, z);
        group.userData = { type: 'decoration', kind: 'tree' };

        return group;
    }

    /**
     * Utwórz skałę.
     *
     * @param {Object} THREE
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {Function} rng
     * @returns {Object} Three.js Mesh
     * @private
     */
    _createRock(THREE, x, y, z, rng) {
        const scale = 0.3 + rng() * 0.7;
        const geo = new THREE.DodecahedronGeometry(scale, 0);
        const rock = new THREE.Mesh(geo, this._rockMat);
        rock.position.set(x, y + scale * 0.3, z);
        rock.rotation.set(rng() * Math.PI, rng() * Math.PI, 0);
        rock.userData = { type: 'decoration', kind: 'rock' };

        return rock;
    }
}

export default DecorationGenerator;
