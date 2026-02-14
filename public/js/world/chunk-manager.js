/**
 * ChunkManager — zarządzanie ładowaniem/usuwaniem chunków wokół gracza.
 *
 * Śledzi pozycję gracza, oblicza które chunki powinny być załadowane,
 * deleguje tworzenie do ChunkLoader i recykling do ChunkPool.
 */

import Debug from '../core/debug.js';
import WorldConfig from './world-config.js';

class ChunkManager {
    /** @type {Map<string, Object>} Załadowane chunki: key → { mesh, decorations, lod } */
    _chunks = new Map();

    /** @type {Object|null} Three.js scene */
    _scene = null;

    /** @type {Object|null} ChunkLoader */
    _loader = null;

    /** @type {Object|null} ChunkPool */
    _pool = null;

    /** @type {Object|null} LodManager */
    _lodManager = null;

    /** @type {{cx: number, cz: number}|null} Ostatnia pozycja gracza w chunkach */
    _lastPlayerChunk = null;

    /**
     * @param {Object} scene - Three.js Scene
     * @param {Object} loader - ChunkLoader
     * @param {Object} pool - ChunkPool
     * @param {Object} lodManager - LodManager
     */
    constructor(scene, loader, pool, lodManager) {
        this._scene = scene;
        this._loader = loader;
        this._pool = pool;
        this._lodManager = lodManager;
    }

    /**
     * Aktualizuj chunki wokół gracza.
     *
     * Wywoływane co klatkę (lub co kilka klatek).
     *
     * @param {number} playerX - Pozycja gracza X (world space)
     * @param {number} playerZ - Pozycja gracza Z (world space)
     * @param {number} viewDistance - Promień widoczności w chunkach
     */
    update(playerX, playerZ, viewDistance) {
        const cx = Math.floor(playerX / WorldConfig.CHUNK_SIZE);
        const cz = Math.floor(playerZ / WorldConfig.CHUNK_SIZE);

        // Optymalizacja: aktualizuj tylko gdy gracz zmienił chunk
        if (this._lastPlayerChunk && this._lastPlayerChunk.cx === cx && this._lastPlayerChunk.cz === cz) {
            return;
        }
        this._lastPlayerChunk = { cx, cz };

        const vd = viewDistance || WorldConfig.VIEW_DISTANCE;
        const ud = WorldConfig.UNLOAD_DISTANCE;

        // Załaduj nowe chunki
        const needed = new Set();
        for (let dx = -vd; dx <= vd; dx++) {
            for (let dz = -vd; dz <= vd; dz++) {
                const key = this._key(cx + dx, cz + dz);
                needed.add(key);

                if (!this._chunks.has(key)) {
                    this._loadChunk(cx + dx, cz + dz);
                }
            }
        }

        // Usuń odległe chunki
        for (const [key, chunkData] of this._chunks) {
            if (!needed.has(key)) {
                const [kcx, kcz] = key.split(',').map(Number);
                const dist = Math.max(Math.abs(kcx - cx), Math.abs(kcz - cz));
                if (dist > ud) {
                    this._unloadChunk(key, chunkData);
                }
            }
        }

        // Aktualizuj LOD
        if (this._lodManager) {
            this._lodManager.update(cx, cz, this._chunks);
        }
    }

    /**
     * Załaduj chunk asynchronicznie.
     *
     * @param {number} chunkX
     * @param {number} chunkZ
     * @private
     */
    _loadChunk(chunkX, chunkZ) {
        const key = this._key(chunkX, chunkZ);

        // Użyj requestIdleCallback lub setTimeout aby nie blokować
        const loadFn = () => {
            if (this._chunks.has(key)) return;

            const chunkData = this._loader.createChunk(chunkX, chunkZ);
            if (chunkData && chunkData.mesh) {
                this._scene.add(chunkData.mesh);
                if (chunkData.decorations) {
                    chunkData.decorations.forEach((d) => this._scene.add(d));
                }
                this._chunks.set(key, chunkData);
            }
        };

        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(loadFn);
        } else {
            setTimeout(loadFn, 0);
        }
    }

    /**
     * Usuń chunk i zwróć do puli.
     *
     * @param {string} key
     * @param {Object} chunkData
     * @private
     */
    _unloadChunk(key, chunkData) {
        if (chunkData.mesh) {
            this._scene.remove(chunkData.mesh);
            if (this._pool) {
                this._pool.release(chunkData.mesh);
            }
        }
        if (chunkData.decorations) {
            chunkData.decorations.forEach((d) => {
                this._scene.remove(d);
                if (this._pool) {
                    this._pool.release(d);
                }
            });
        }
        this._chunks.delete(key);
    }

    /**
     * Klucz chunka.
     *
     * @param {number} cx
     * @param {number} cz
     * @returns {string}
     * @private
     */
    _key(cx, cz) {
        return `${cx},${cz}`;
    }

    /**
     * Wyczyść wszystkie chunki (np. przy wyjściu z gry).
     */
    clear() {
        for (const [key, chunkData] of this._chunks) {
            this._unloadChunk(key, chunkData);
        }
        this._chunks.clear();
        this._lastPlayerChunk = null;
        Debug.info('chunk-manager', 'All chunks cleared');
    }

    /**
     * Liczba załadowanych chunków.
     *
     * @returns {number}
     */
    get chunkCount() {
        return this._chunks.size;
    }
}

export default ChunkManager;
