/**
 * AutosaveSystem — system ECS automatycznego zapisu gry.
 *
 * Zapisuje stan gry co AUTOSAVE_INTERVAL sekund (konfigurowalne).
 * Działa tylko w trybie singleplayer.
 */

import Debug from '../core/debug.js';
import SaveManager from '../utils/save-manager.js';

class AutosaveSystem {
    /** @type {number} Interwał autosave w sekundach */
    _interval;

    /** @type {number} Akumulator czasu */
    _timer = 0;

    /** @type {boolean} */
    _enabled;

    /** @type {Object} Dane gry (territory, seed, mode) */
    _gameData = {};

    /** @type {boolean} Czy trwa zapis */
    _saving = false;

    /**
     * @param {Object} options
     * @param {number} [options.interval=60] - Interwał w sekundach
     * @param {boolean} [options.enabled=true]
     * @param {Object} [options.gameData={}]
     */
    constructor(options = {}) {
        this._interval = options.interval || 60;
        this._enabled = options.enabled !== undefined ? options.enabled : true;
        this._gameData = options.gameData || {};
    }

    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        if (!this._enabled || this._saving) return;

        this._timer += dt;

        if (this._timer >= this._interval) {
            this._timer = 0;
            this._performAutosave(world);
        }
    }

    /**
     * Wykonaj autosave.
     *
     * @param {import('../core/ecs.js').World} world
     * @private
     */
    async _performAutosave(world) {
        this._saving = true;
        try {
            await SaveManager.autosave(world, this._gameData);
        } catch (err) {
            Debug.error('autosave', 'Autosave failed', { error: err.message });
        } finally {
            this._saving = false;
        }
    }

    /**
     * Włącz/wyłącz autosave.
     *
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._enabled = enabled;
    }

    /**
     * Zaktualizuj dane gry.
     *
     * @param {Object} gameData
     */
    setGameData(gameData) {
        this._gameData = gameData;
    }
}

export default AutosaveSystem;
