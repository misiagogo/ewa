/**
 * DecorationGenerator — generuje dekoracje per chunk per biom.
 *
 * Typy: drzewa, skały, trawa, kwiaty, krzewy.
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

    /** @type {Array<Object>} Cached grass materials (kilka odcieni) */
    _grassMats = [];

    /** @type {Array<Object>} Cached flower materials (różne kolory) */
    _flowerMats = [];

    /** @type {Object} Cached bush material */
    _bushMat = null;

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

        // Materiały trawy — kilka odcieni zieleni
        const grassBase = this._biome.grassColor || 0x3a7a2a;
        this._grassMats = [
            new THREE.MeshLambertMaterial({ color: grassBase }),
            new THREE.MeshLambertMaterial({ color: this._shiftColor(grassBase, 0.15) }),
            new THREE.MeshLambertMaterial({ color: this._shiftColor(grassBase, -0.1) }),
        ];

        // Materiały kwiatów — różne kolory
        const flowerColors = this._biome.flowerColors || [0xff4466, 0xffaa22, 0xeedd33, 0xaa66ff, 0xff88cc];
        this._flowerMats = flowerColors.map((c) => new THREE.MeshLambertMaterial({ color: c }));

        // Materiał krzewów
        this._bushMat = new THREE.MeshLambertMaterial({ color: this._biome.bushColor || 0x2a6a1a });
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

            const treeEnd = this._biome.treeChance;
            const rockEnd = treeEnd + this._biome.rockChance;
            const grassEnd = rockEnd + (this._biome.grassChance || 0.25);
            const flowerEnd = grassEnd + (this._biome.flowerChance || 0.08);
            const bushEnd = flowerEnd + (this._biome.bushChance || 0.06);

            if (roll < treeEnd) {
                const tree = this._createTree(THREE, worldX, height, worldZ, nextRandom);
                if (tree) decorations.push(tree);
            } else if (roll < rockEnd) {
                const rock = this._createRock(THREE, worldX, height, worldZ, nextRandom);
                if (rock) decorations.push(rock);
            } else if (roll < grassEnd) {
                const grass = this._createGrass(THREE, worldX, height, worldZ, nextRandom);
                if (grass) decorations.push(grass);
            } else if (roll < flowerEnd) {
                const flower = this._createFlower(THREE, worldX, height, worldZ, nextRandom);
                if (flower) decorations.push(flower);
            } else if (roll < bushEnd) {
                const bush = this._createBush(THREE, worldX, height, worldZ, nextRandom);
                if (bush) decorations.push(bush);
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
        group.userData = { type: 'decoration', kind: 'tree', collider: true, colliderRadius: 0.3 };

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
        rock.userData = { type: 'decoration', kind: 'rock', collider: true, colliderRadius: scale * 0.6 };

        return rock;
    }

    /**
     * Utwórz kępkę trawy (3-5 źdźbeł).
     *
     * @param {Object} THREE
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {Function} rng
     * @returns {Object} Three.js Group
     * @private
     */
    _createGrass(THREE, x, y, z, rng) {
        const group = new THREE.Group();
        const bladeCount = 3 + Math.floor(rng() * 3);

        for (let i = 0; i < bladeCount; i++) {
            const h = 0.15 + rng() * 0.25;
            const w = 0.02 + rng() * 0.02;
            const geo = new THREE.PlaneGeometry(w, h);
            const mat = this._grassMats[Math.floor(rng() * this._grassMats.length)];
            const blade = new THREE.Mesh(geo, mat);

            blade.position.set(
                (rng() - 0.5) * 0.15,
                h / 2,
                (rng() - 0.5) * 0.15
            );
            blade.rotation.y = rng() * Math.PI;
            blade.rotation.x = (rng() - 0.5) * 0.3;
            group.add(blade);
        }

        group.position.set(x, y, z);
        group.userData = { type: 'decoration', kind: 'grass' };
        return group;
    }

    /**
     * Utwórz kwiat (łodyga + korona).
     *
     * @param {Object} THREE
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {Function} rng
     * @returns {Object} Three.js Group
     * @private
     */
    _createFlower(THREE, x, y, z, rng) {
        const group = new THREE.Group();

        // Łodyga
        const stemH = 0.15 + rng() * 0.2;
        const stemGeo = new THREE.CylinderGeometry(0.008, 0.01, stemH, 4);
        const stemMat = this._grassMats[0];
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(0, stemH / 2, 0);
        group.add(stem);

        // Korona kwiatu
        const petalR = 0.03 + rng() * 0.04;
        const petalGeo = new THREE.SphereGeometry(petalR, 5, 5);
        const petalMat = this._flowerMats[Math.floor(rng() * this._flowerMats.length)];
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(0, stemH + petalR * 0.5, 0);
        group.add(petal);

        group.position.set(x, y, z);
        group.userData = { type: 'decoration', kind: 'flower' };
        return group;
    }

    /**
     * Utwórz krzew (kilka nakładających się sfer).
     *
     * @param {Object} THREE
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {Function} rng
     * @returns {Object} Three.js Group
     * @private
     */
    _createBush(THREE, x, y, z, rng) {
        const group = new THREE.Group();
        const sphereCount = 2 + Math.floor(rng() * 3);

        for (let i = 0; i < sphereCount; i++) {
            const r = 0.15 + rng() * 0.2;
            const geo = new THREE.SphereGeometry(r, 5, 5);
            const sphere = new THREE.Mesh(geo, this._bushMat);
            sphere.position.set(
                (rng() - 0.5) * 0.2,
                r * 0.7 + rng() * 0.1,
                (rng() - 0.5) * 0.2
            );
            group.add(sphere);
        }

        group.position.set(x, y, z);
        group.userData = { type: 'decoration', kind: 'bush', collider: true, colliderRadius: 0.25 };
        return group;
    }

    /**
     * Przesuń kolor o podany offset jasności.
     *
     * @param {number} hex
     * @param {number} offset - ujemny = ciemniejszy, dodatni = jaśniejszy
     * @returns {number}
     * @private
     */
    _shiftColor(hex, offset) {
        const r = Math.min(255, Math.max(0, ((hex >> 16) & 0xff) + Math.round(offset * 255)));
        const g = Math.min(255, Math.max(0, ((hex >> 8) & 0xff) + Math.round(offset * 255)));
        const b = Math.min(255, Math.max(0, (hex & 0xff) + Math.round(offset * 255)));
        return (r << 16) | (g << 8) | b;
    }
}

export default DecorationGenerator;
