/**
 * ChunkPool — object pooling dla meshów chunków.
 *
 * Recykluje geometrie i meshe zamiast tworzyć nowe.
 * Zmniejsza garbage collection i alokacje pamięci.
 */

import Debug from '../core/debug.js';
import WorldConfig from './world-config.js';

class ChunkPool {
    /** @type {Array<Object>} Pula wolnych meshów terenu */
    _terrainPool = [];

    /** @type {Array<Object>} Pula wolnych meshów dekoracji */
    _decorationPool = [];

    /** @type {number} */
    _maxSize;

    /**
     * @param {number} [maxSize] - Maksymalny rozmiar puli
     */
    constructor(maxSize) {
        this._maxSize = maxSize || WorldConfig.CHUNK_POOL_SIZE;
    }

    /**
     * Pobierz mesh terenu z puli lub null jeśli pula pusta.
     *
     * @returns {Object|null} Three.js Mesh lub null
     */
    acquireTerrain() {
        if (this._terrainPool.length > 0) {
            return this._terrainPool.pop();
        }
        return null;
    }

    /**
     * Pobierz mesh dekoracji z puli lub null.
     *
     * @returns {Object|null}
     */
    acquireDecoration() {
        if (this._decorationPool.length > 0) {
            return this._decorationPool.pop();
        }
        return null;
    }

    /**
     * Zwróć mesh do puli.
     *
     * @param {Object} mesh - Three.js Mesh
     */
    release(mesh) {
        if (!mesh) return;

        // Rozróżnij typ meshu po userData
        if (mesh.userData && mesh.userData.type === 'terrain') {
            if (this._terrainPool.length < this._maxSize) {
                mesh.visible = false;
                this._terrainPool.push(mesh);
                return;
            }
        } else {
            if (this._decorationPool.length < this._maxSize) {
                mesh.visible = false;
                this._decorationPool.push(mesh);
                return;
            }
        }

        // Pula pełna — dispose
        this._disposeMesh(mesh);
    }

    /**
     * Wyczyść pulę i zwolnij pamięć.
     */
    clear() {
        this._terrainPool.forEach((m) => this._disposeMesh(m));
        this._decorationPool.forEach((m) => this._disposeMesh(m));
        this._terrainPool = [];
        this._decorationPool = [];
        Debug.info('chunk-pool', 'Pool cleared');
    }

    /**
     * Dispose mesh i jego geometrii/materiału.
     *
     * @param {Object} mesh
     * @private
     */
    _disposeMesh(mesh) {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => m.dispose());
            } else {
                mesh.material.dispose();
            }
        }
    }

    /**
     * Statystyki puli.
     *
     * @returns {{terrain: number, decoration: number}}
     */
    get stats() {
        return {
            terrain: this._terrainPool.length,
            decoration: this._decorationPool.length,
        };
    }
}

export default ChunkPool;
