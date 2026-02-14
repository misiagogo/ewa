/**
 * CreatorScreen — kreator kota z podglądem 3D.
 *
 * Formularz: imię, kolor futra, wzór (6 opcji), kolor oczu, wiek, płeć.
 * Podgląd 3D aktualizuje się na żywo przy zmianie parametrów.
 * Po zatwierdzeniu przechodzi do gry (singleplayer) lub dołącza do pokoju (multiplayer).
 *
 * Dane wejściowe: { mode, territory, roomId? }
 */

import Debug from '../core/debug.js';
import ApiClient from '../core/api-client.js';
import EventBus from '../core/event-bus.js';
import { __ } from '../lang/lang.js';
import CatModelGenerator, { FUR_PATTERNS } from '../generators/cat-model-generator.js';

class CreatorScreen {
    /** @type {Object} */
    _data = {};

    /** @type {Object|null} Three.js module */
    _THREE = null;

    /** @type {Object|null} Mini renderer podglądu */
    _previewRenderer = null;

    /** @type {Object|null} Mini scena podglądu */
    _previewScene = null;

    /** @type {Object|null} Mini kamera podglądu */
    _previewCamera = null;

    /** @type {Object|null} Aktualny model kota w podglądzie */
    _catModel = null;

    /** @type {CatModelGenerator|null} */
    _catGen = null;

    /** @type {number|null} ID animacji */
    _animFrameId = null;

    /** @type {number} Obrót podglądu */
    _previewRotation = 0;

    /**
     * @param {Object} data - { mode, territory, roomId? }
     */
    async enter(data) {
        this._data = data || {};
        this._previewRotation = 0;
        this._render();
        await this._initPreview();
        this._bindEvents();
        this._startPreviewLoop();
    }

    exit() {
        this._stopPreviewLoop();

        if (this._previewRenderer) {
            this._previewRenderer.dispose();
            this._previewRenderer = null;
        }
        this._previewScene = null;
        this._previewCamera = null;
        this._catModel = null;
        this._catGen = null;
        this._THREE = null;

        document.getElementById('app').innerHTML = '';
    }

    update() {}

    /**
     * @private
     */
    _render() {
        const patternOptions = FUR_PATTERNS.map((p) =>
            `<option value="${p}" ${p === 'striped' ? 'selected' : ''}>${__('screen.creator.pattern.' + p)}</option>`
        ).join('');

        document.getElementById('app').innerHTML = `
            <div class="game-screen">
                <div class="game-panel creator-panel">
                    <h2 class="game-subtitle text-center mb-3">${__('screen.creator.title')}</h2>
                    <div class="row g-3">
                        <div class="col-md-5">
                            <div class="creator-preview-container">
                                <canvas id="cat-preview-canvas" class="creator-preview-canvas"></canvas>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div id="creator-error" class="game-error d-none mb-2"></div>
                            <form id="creator-form">
                                <div class="mb-2">
                                    <label class="game-label">${__('screen.creator.name')}</label>
                                    <input type="text" id="cat-name" class="form-control game-input" required maxlength="50" value="Mruczek">
                                </div>
                                <div class="mb-2">
                                    <label class="game-label">${__('screen.creator.fur_color')}</label>
                                    <input type="color" id="cat-fur-color" class="form-control form-control-color game-input" value="#ff8800">
                                </div>
                                <div class="mb-2">
                                    <label class="game-label">${__('screen.creator.pattern')}</label>
                                    <select id="cat-pattern" class="form-select game-input">
                                        ${patternOptions}
                                    </select>
                                </div>
                                <div class="mb-2">
                                    <label class="game-label">${__('screen.creator.eye_color')}</label>
                                    <input type="color" id="cat-eye-color" class="form-control form-control-color game-input" value="#00cc44">
                                </div>
                                <div class="mb-2">
                                    <label class="game-label">${__('screen.creator.weight')} <span id="weight-value" class="badge bg-dark">4.5 kg</span></label>
                                    <input type="range" id="cat-weight" class="form-range" min="2" max="12" step="0.5" value="4.5">
                                </div>
                                <div class="row mb-2">
                                    <div class="col-6">
                                        <label class="game-label">${__('screen.creator.age')}</label>
                                        <select id="cat-age" class="form-select game-input">
                                            <option value="young">${__('screen.creator.age.young')}</option>
                                            <option value="adult" selected>${__('screen.creator.age.adult')}</option>
                                            <option value="senior">${__('screen.creator.age.senior')}</option>
                                        </select>
                                    </div>
                                    <div class="col-6">
                                        <label class="game-label">${__('screen.creator.gender')}</label>
                                        <select id="cat-gender" class="form-select game-input">
                                            <option value="male">${__('screen.creator.gender.male')}</option>
                                            <option value="female">${__('screen.creator.gender.female')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="d-grid gap-2 mt-3">
                                    <button type="submit" class="btn btn-game" id="btn-start">${__('screen.creator.start')}</button>
                                    <button type="button" class="btn btn-game-secondary" id="btn-back">${__('screen.creator.back')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Inicjalizuj mini scenę Three.js do podglądu kota.
     *
     * @private
     */
    async _initPreview() {
        try {
            this._THREE = await import('three');
            const THREE = this._THREE;

            const canvas = document.getElementById('cat-preview-canvas');
            if (!canvas) return;

            const width = canvas.parentElement.clientWidth || 280;
            const height = 300;
            canvas.width = width;
            canvas.height = height;

            this._previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            this._previewRenderer.setSize(width, height);
            this._previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this._previewRenderer.setClearColor(0x1a1a2e, 1);

            this._previewScene = new THREE.Scene();

            this._previewCamera = new THREE.PerspectiveCamera(40, width / height, 0.01, 50);
            this._previewCamera.position.set(0, 0.25, 0.7);
            this._previewCamera.lookAt(0, 0.15, 0);

            // Oświetlenie
            const ambient = new THREE.AmbientLight(0xffffff, 0.7);
            this._previewScene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
            dirLight.position.set(2, 3, 2);
            this._previewScene.add(dirLight);

            const backLight = new THREE.DirectionalLight(0x6688cc, 0.3);
            backLight.position.set(-2, 1, -2);
            this._previewScene.add(backLight);

            // Podłoże (okrąg)
            const floorGeo = new THREE.CircleGeometry(0.3, 32);
            const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a4a, roughness: 0.9 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = 0;
            this._previewScene.add(floor);

            this._catGen = new CatModelGenerator(THREE);
            await this._rebuildCatPreview();

            Debug.info('creator', 'Preview initialized');
        } catch (err) {
            Debug.error('creator', 'Preview init failed', { error: err.message });
        }
    }

    /**
     * Przebuduj model kota w podglądzie na podstawie aktualnych wartości formularza.
     *
     * @private
     */
    async _rebuildCatPreview() {
        if (!this._catGen || !this._previewScene) return;

        // Usuń stary model
        if (this._catModel) {
            this._previewScene.remove(this._catModel);
        }

        const config = this._getCurrentConfig();
        try {
            this._catModel = await this._catGen.create(config);
            this._previewScene.add(this._catModel);
        } catch (err) {
            Debug.error('creator', 'Cat preview rebuild failed', { error: err.message });
        }
    }

    /**
     * Pobierz aktualną konfigurację z formularza.
     *
     * @returns {Object}
     * @private
     */
    _getCurrentConfig() {
        return {
            fur_color: document.getElementById('cat-fur-color')?.value || '#ff8800',
            pattern: document.getElementById('cat-pattern')?.value || 'solid',
            eye_color: document.getElementById('cat-eye-color')?.value || '#00cc44',
            weight: parseFloat(document.getElementById('cat-weight')?.value) || 4.5,
            age: document.getElementById('cat-age')?.value || 'adult',
            gender: document.getElementById('cat-gender')?.value || 'male',
        };
    }

    /**
     * Pętla animacji podglądu — obrót kota.
     *
     * @private
     */
    _startPreviewLoop() {
        const animate = () => {
            this._animFrameId = requestAnimationFrame(animate);

            if (this._catModel) {
                this._previewRotation += 0.008;
                this._catModel.rotation.y = this._previewRotation;
            }

            if (this._previewRenderer && this._previewScene && this._previewCamera) {
                this._previewRenderer.render(this._previewScene, this._previewCamera);
            }
        };
        animate();
    }

    /**
     * @private
     */
    _stopPreviewLoop() {
        if (this._animFrameId) {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = null;
        }
    }

    /**
     * @private
     */
    _bindEvents() {
        // Live update podglądu przy zmianie parametrów
        const updateFields = ['cat-fur-color', 'cat-pattern', 'cat-eye-color', 'cat-weight', 'cat-age', 'cat-gender'];
        for (const fieldId of updateFields) {
            const el = document.getElementById(fieldId);
            if (el) {
                el.addEventListener('input', () => this._rebuildCatPreview());
                el.addEventListener('change', () => this._rebuildCatPreview());
            }
        }

        // Live update etykiety wagi
        const weightSlider = document.getElementById('cat-weight');
        const weightLabel = document.getElementById('weight-value');
        if (weightSlider && weightLabel) {
            weightSlider.addEventListener('input', () => {
                weightLabel.textContent = weightSlider.value + ' kg';
            });
        }

        document.getElementById('creator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleStart();
        });

        document.getElementById('btn-back').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('territory', { mode: this._data.mode });
        });
    }

    /**
     * Zbierz dane kota i przejdź do gry lub dołącz do pokoju.
     *
     * @private
     */
    async _handleStart() {
        const errorEl = document.getElementById('creator-error');
        const startBtn = document.getElementById('btn-start');
        errorEl.classList.add('d-none');
        startBtn.disabled = true;

        const catConfig = {
            name: document.getElementById('cat-name').value.trim(),
            ...this._getCurrentConfig(),
        };

        if (!catConfig.name) {
            errorEl.textContent = __('validation.required', { attribute: __('screen.creator.name') });
            errorEl.classList.remove('d-none');
            startBtn.disabled = false;
            return;
        }

        try {
            if (this._data.mode === 'multiplayer' && this._data.roomId) {
                // Dołącz do istniejącego pokoju
                const result = await ApiClient.post(`/api/rooms/${this._data.roomId}/join`, {
                    cat_config: catConfig,
                });

                if (result.ok) {
                    Debug.info('creator', 'Joined room', { roomId: this._data.roomId });
                    window.__catSurvival.stateMachine.change('game', {
                        mode: 'multiplayer',
                        territory: this._data.territory,
                        catConfig,
                        room: result.data.room?.data || result.data.room,
                    });
                } else {
                    errorEl.textContent = result.data?.message || __('error.network');
                    errorEl.classList.remove('d-none');
                }
            } else if (this._data.mode === 'multiplayer') {
                // Tworzenie nowego pokoju
                const result = await ApiClient.post('/api/rooms', {
                    name: catConfig.name + "'s Room",
                    territory: this._data.territory,
                    cat_config: catConfig,
                });

                if (result.ok) {
                    Debug.info('creator', 'Created room', { roomId: result.data.data?.id });
                    window.__catSurvival.stateMachine.change('game', {
                        mode: 'multiplayer',
                        territory: this._data.territory,
                        catConfig,
                        room: result.data.data,
                    });
                } else {
                    errorEl.textContent = result.data?.message || __('error.network');
                    errorEl.classList.remove('d-none');
                }
            } else {
                // Singleplayer — przejdź bezpośrednio do gry
                Debug.info('creator', 'Starting singleplayer', { territory: this._data.territory });
                EventBus.emit('game:start', {
                    mode: 'singleplayer',
                    territory: this._data.territory,
                    catConfig,
                });
                window.__catSurvival.stateMachine.change('game', {
                    mode: 'singleplayer',
                    territory: this._data.territory,
                    catConfig,
                });
            }
        } catch (err) {
            Debug.error('creator', 'Start failed', { error: err.message });
            errorEl.textContent = __('error.network');
            errorEl.classList.remove('d-none');
        } finally {
            startBtn.disabled = false;
        }
    }
}

export default CreatorScreen;
