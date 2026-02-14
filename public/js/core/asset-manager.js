/**
 * AssetManager — centralne ładowanie i cache zasobów.
 *
 * Cache'uje geometrie, materiały i tekstury aby uniknąć duplikatów.
 * Singleton — jeden per aplikację.
 */

import Debug from './debug.js';

class AssetManager {
    /** @type {Map<string, Object>} Cache geometrii */
    static _geometries = new Map();

    /** @type {Map<string, Object>} Cache materiałów */
    static _materials = new Map();

    /** @type {Map<string, Object>} Cache tekstur */
    static _textures = new Map();

    /** @type {Object|null} Three.js module */
    static _THREE = null;

    /**
     * Inicjalizacja z modułem Three.js.
     *
     * @param {Object} THREE
     */
    static init(THREE) {
        AssetManager._THREE = THREE;
        Debug.info('asset-manager', 'Initialized');
    }

    /**
     * Pobierz lub utwórz materiał (cache po kluczu).
     *
     * @param {string} key - Unikalny klucz (np. 'fur_#ff8800')
     * @param {Function} createFn - Funkcja tworząca materiał jeśli brak w cache
     * @returns {Object} Three.js Material
     */
    static getMaterial(key, createFn) {
        if (AssetManager._materials.has(key)) {
            return AssetManager._materials.get(key);
        }
        const material = createFn();
        AssetManager._materials.set(key, material);
        return material;
    }

    /**
     * Pobierz lub utwórz geometrię (cache po kluczu).
     *
     * @param {string} key - Unikalny klucz (np. 'paw_cylinder')
     * @param {Function} createFn - Funkcja tworząca geometrię jeśli brak w cache
     * @returns {Object} Three.js Geometry
     */
    static getGeometry(key, createFn) {
        if (AssetManager._geometries.has(key)) {
            return AssetManager._geometries.get(key);
        }
        const geometry = createFn();
        AssetManager._geometries.set(key, geometry);
        return geometry;
    }

    /**
     * Pobierz lub załaduj teksturę (cache po URL).
     *
     * @param {string} url - URL tekstury
     * @returns {Promise<Object>} Three.js Texture
     */
    static async getTexture(url) {
        if (AssetManager._textures.has(url)) {
            return AssetManager._textures.get(url);
        }

        const THREE = AssetManager._THREE;
        if (!THREE) {
            Debug.error('asset-manager', 'THREE not initialized');
            return null;
        }

        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    AssetManager._textures.set(url, texture);
                    Debug.debug('asset-manager', `Texture loaded: ${url}`);
                    resolve(texture);
                },
                undefined,
                (err) => {
                    Debug.error('asset-manager', `Texture failed: ${url}`, { error: err.message });
                    reject(err);
                }
            );
        });
    }

    /**
     * Wyczyść cały cache i zwolnij pamięć.
     */
    static clear() {
        AssetManager._geometries.forEach((g) => g.dispose());
        AssetManager._materials.forEach((m) => m.dispose());
        AssetManager._textures.forEach((t) => t.dispose());
        AssetManager._geometries.clear();
        AssetManager._materials.clear();
        AssetManager._textures.clear();
        Debug.info('asset-manager', 'Cache cleared');
    }

    /**
     * Statystyki cache.
     *
     * @returns {{geometries: number, materials: number, textures: number}}
     */
    static get stats() {
        return {
            geometries: AssetManager._geometries.size,
            materials: AssetManager._materials.size,
            textures: AssetManager._textures.size,
        };
    }
}

export default AssetManager;
