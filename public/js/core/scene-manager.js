/**
 * SceneManager — most ECS ↔ Three.js scene graph.
 *
 * Zarządza dodawaniem/usuwaniem meshów do sceny Three.js
 * na podstawie komponentów Renderable w ECS World.
 */

import Debug from './debug.js';

class SceneManager {
    /** @type {Object|null} Three.js Scene */
    _scene = null;

    /** @type {Object|null} Three.js Camera */
    _camera = null;

    /** @type {Object|null} Three.js WebGLRenderer */
    _renderer = null;

    /**
     * Inicjalizacja z istniejącą sceną Three.js.
     *
     * @param {Object} scene - Three.js Scene
     * @param {Object} camera - Three.js Camera
     * @param {Object} renderer - Three.js WebGLRenderer
     */
    init(scene, camera, renderer) {
        this._scene = scene;
        this._camera = camera;
        this._renderer = renderer;
        Debug.info('scene-manager', 'Initialized');
    }

    /**
     * Dodaj obiekt 3D do sceny.
     *
     * @param {Object} object3D - Three.js Object3D / Mesh / Group
     */
    add(object3D) {
        if (this._scene && object3D) {
            this._scene.add(object3D);
        }
    }

    /**
     * Usuń obiekt 3D ze sceny.
     *
     * @param {Object} object3D
     */
    remove(object3D) {
        if (this._scene && object3D) {
            this._scene.remove(object3D);
        }
    }

    /**
     * Renderuj scenę.
     */
    render() {
        if (this._renderer && this._scene && this._camera) {
            this._renderer.render(this._scene, this._camera);
        }
    }

    /**
     * Pobierz scenę Three.js.
     *
     * @returns {Object|null}
     */
    get scene() {
        return this._scene;
    }

    /**
     * Pobierz kamerę Three.js.
     *
     * @returns {Object|null}
     */
    get camera() {
        return this._camera;
    }

    /**
     * Pobierz renderer Three.js.
     *
     * @returns {Object|null}
     */
    get renderer() {
        return this._renderer;
    }

    /**
     * Wyczyść scenę (usuń wszystkie obiekty poza światłami).
     */
    clear() {
        if (!this._scene) return;

        const toRemove = [];
        this._scene.traverse((child) => {
            if (child.isMesh || child.isGroup) {
                toRemove.push(child);
            }
        });
        toRemove.forEach((obj) => this._scene.remove(obj));
        Debug.info('scene-manager', 'Scene cleared');
    }

    /**
     * Dispose renderer i zasoby.
     */
    dispose() {
        if (this._renderer) {
            this._renderer.dispose();
            this._renderer = null;
        }
        this._scene = null;
        this._camera = null;
        Debug.info('scene-manager', 'Disposed');
    }
}

export default SceneManager;
