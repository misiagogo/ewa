/**
 * GameScreen — ekran gry 3D z pełnym ECS.
 *
 * Inicjalizuje scenę Three.js, ECS World, systemy, chunk system.
 * Systemy w kolejności: InputSystem → MovementSystem → ChunkSystem → CameraSystem → AnimationSystem → RenderSystem.
 *
 * Dane wejściowe: { mode, territory, catConfig, room? }
 */

import Debug from '../core/debug.js';
import EventBus from '../core/event-bus.js';
import { __ } from '../lang/lang.js';
import { World } from '../core/ecs.js';
import SceneManager from '../core/scene-manager.js';
import AssetManager from '../core/asset-manager.js';

import ChunkManager from '../world/chunk-manager.js';
import ChunkLoader from '../world/chunk-loader.js';
import ChunkPool from '../world/chunk-pool.js';
import LodManager from '../world/lod-manager.js';
import WorldConfig from '../world/world-config.js';

import { createCatEntity } from '../entities/cat-entity.js';

import Transform from '../components/transform.js';
import Velocity from '../components/velocity.js';
import PlayerInput from '../components/player-input.js';
import PlayerControlled from '../components/player-controlled.js';
import CameraTarget from '../components/camera-target.js';

import InputSystem from '../systems/input-system.js';
import MovementSystem from '../systems/movement-system.js';
import ChunkSystem from '../systems/chunk-system.js';
import CameraSystem from '../systems/camera-system.js';
import AnimationSystem from '../systems/animation-system.js';
import RenderSystem from '../systems/render-system.js';

class GameScreen {
    /** @type {Object} */
    _data = {};

    /** @type {World|null} ECS World */
    _world = null;

    /** @type {SceneManager} */
    _sceneManager = new SceneManager();

    /** @type {Object|null} Three.js renderer */
    _renderer = null;

    /** @type {Object|null} Three.js scene */
    _scene = null;

    /** @type {Object|null} Three.js camera */
    _camera = null;

    /** @type {ChunkManager|null} */
    _chunkManager = null;

    /** @type {InputSystem|null} */
    _inputSystem = null;

    /** @type {Object|null} TerrainGenerator ref */
    _terrainGen = null;

    /** @type {number|null} Player entity ID */
    _playerEntityId = null;

    /** @type {Function|null} */
    _onResize = null;

    /**
     * @param {Object} data - { mode, territory, catConfig, room? }
     */
    async enter(data) {
        this._data = data || {};
        Debug.info('game-screen', 'Entering game', this._data);

        document.getElementById('app').innerHTML = '';
        this._renderHUD();
        await this._initEngine();
    }

    exit() {
        // Cleanup input system
        if (this._inputSystem) {
            this._inputSystem.dispose();
            this._inputSystem = null;
        }

        // Cleanup chunk system
        if (this._chunkManager) {
            this._chunkManager.clear();
            this._chunkManager = null;
        }

        // Cleanup scene manager
        this._sceneManager.dispose();

        // Cleanup resize
        if (this._onResize) window.removeEventListener('resize', this._onResize);

        this._world = null;
        this._scene = null;
        this._camera = null;
        this._renderer = null;
        this._terrainGen = null;
        this._playerEntityId = null;

        document.getElementById('app').innerHTML = '';
        const canvas = document.getElementById('game-canvas');
        canvas.width = 0;
        canvas.height = 0;

        Debug.info('game-screen', 'Exited game');
    }

    /**
     * @param {number} dt
     */
    update(dt) {
        if (!this._world || !this._renderer) return;

        // ECS update — systemy w prawidłowej kolejności
        this._world.update(dt);

        // Terrain height tracking dla gracza
        this._updatePlayerHeight();

        // HUD pozycji
        this._updateHudPosition();

        // Render
        this._sceneManager.render();
    }

    /**
     * @private
     */
    _renderHUD() {
        const app = document.getElementById('app');
        const modeLabel = this._data.mode === 'multiplayer' ? 'MP' : 'SP';
        const territoryLabel = __('screen.territory.' + (this._data.territory || 'pine_forest'));

        app.innerHTML = `
            <div class="game-hud">
                <div class="position-absolute top-0 start-0 p-3">
                    <span class="badge bg-dark" id="hud-info">${modeLabel} &middot; ${territoryLabel}</span>
                </div>
                <div class="position-absolute top-0 end-0 p-3">
                    <button class="btn btn-sm btn-game-secondary" id="btn-menu">${__('screen.game.menu')}</button>
                </div>
                <div class="position-absolute bottom-0 start-0 p-3">
                    <span class="badge bg-dark" id="hud-pos">0, 0</span>
                </div>
            </div>
        `;

        document.getElementById('btn-menu').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('welcome');
        });
    }

    /**
     * Inicjalizuj silnik: Three.js + ECS World + systemy.
     *
     * @private
     */
    async _initEngine() {
        try {
            const THREE = await import('three');
            AssetManager.init(THREE);

            // Renderer
            const canvas = document.getElementById('game-canvas');
            this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            this._renderer.setSize(window.innerWidth, window.innerHeight);
            this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this._renderer.setClearColor(0x87ceeb);

            // Scene
            this._scene = new THREE.Scene();
            this._scene.fog = new THREE.Fog(0x87ceeb, 80, 200);

            // Camera
            this._camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

            // Scene Manager
            this._sceneManager.init(this._scene, this._camera, this._renderer);

            // Oświetlenie
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this._scene.add(ambientLight);
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
            dirLight.position.set(50, 80, 50);
            this._scene.add(dirLight);

            // Chunk system
            const seed = this._data.room?.world_seed || Math.floor(Math.random() * 99999999);
            const territory = this._data.territory || 'pine_forest';

            const loader = new ChunkLoader(seed, territory, THREE);
            const pool = new ChunkPool();
            const lodManager = new LodManager();
            this._terrainGen = loader._terrainGen;
            this._chunkManager = new ChunkManager(this._scene, loader, pool, lodManager);

            // ECS World
            this._world = new World();

            // Systemy — kolejność ma znaczenie!
            this._inputSystem = new InputSystem();
            this._inputSystem.init();

            this._world.addSystem(this._inputSystem);
            this._world.addSystem(new MovementSystem());
            this._world.addSystem(new ChunkSystem(this._chunkManager));
            this._world.addSystem(new CameraSystem(this._camera));
            this._world.addSystem(new AnimationSystem());
            this._world.addSystem(new RenderSystem());

            // Encja gracza (kot)
            const startY = this._terrainGen ? this._terrainGen.getHeight(0, 0) + 0.3 : 2;
            this._playerEntityId = createCatEntity(
                this._world, this._scene, THREE,
                this._data.catConfig || {},
                0, startY, 0
            );

            // Dodaj brakujące komponenty do encji gracza
            this._world.addComponent(this._playerEntityId, new PlayerInput());
            this._world.addComponent(this._playerEntityId, new CameraTarget(8, 5, 0.08));

            // Załaduj początkowe chunki
            this._chunkManager.update(0, 0);

            // Resize handler
            this._onResize = () => {
                this._camera.aspect = window.innerWidth / window.innerHeight;
                this._camera.updateProjectionMatrix();
                this._renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', this._onResize);

            Debug.info('game-screen', 'ECS engine initialized', { seed, territory, systems: 6 });
        } catch (err) {
            Debug.error('game-screen', 'Engine init failed', { error: err.message });
        }
    }

    /**
     * Aktualizuj wysokość gracza na terenie.
     *
     * @private
     */
    _updatePlayerHeight() {
        if (!this._terrainGen || !this._playerEntityId || !this._world) return;

        const transform = this._world.getComponent(this._playerEntityId, Transform);
        if (transform) {
            const terrainY = this._terrainGen.getHeight(transform.x, transform.z);
            transform.y = terrainY + 0.3;
        }
    }

    /**
     * Aktualizuj HUD pozycji.
     *
     * @private
     */
    _updateHudPosition() {
        if (!this._playerEntityId || !this._world) return;

        const transform = this._world.getComponent(this._playerEntityId, Transform);
        if (transform) {
            const posEl = document.getElementById('hud-pos');
            if (posEl) {
                posEl.textContent = `${Math.round(transform.x)}, ${Math.round(transform.z)}`;
            }
        }
    }
}

export default GameScreen;
