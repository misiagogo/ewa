/**
 * GameLoop — główna pętla gry oparta na requestAnimationFrame.
 *
 * Dostarcza delta time w sekundach. Obsługuje start/stop/pause.
 *
 * @example
 * const loop = new GameLoop((dt) => {
 *     world.update(dt);
 *     renderer.render(scene, camera);
 * });
 * loop.start();
 */

import Debug from './debug.js';

class GameLoop {
    /** @type {Function} */
    _updateFn;

    /** @type {number|null} */
    _rafId = null;

    /** @type {number} */
    _lastTime = 0;

    /** @type {boolean} */
    _running = false;

    /** @type {boolean} */
    _paused = false;

    /** @type {number} */
    _maxDt = 0.1;

    /**
     * @param {Function} updateFn - Funkcja wywoływana co klatkę z argumentem dt (sekundy)
     */
    constructor(updateFn) {
        this._updateFn = updateFn;
        this._tick = this._tick.bind(this);
    }

    /**
     * Uruchom pętlę gry.
     */
    start() {
        if (this._running) return;
        this._running = true;
        this._paused = false;
        this._lastTime = performance.now();
        this._rafId = requestAnimationFrame(this._tick);
        Debug.info('game-loop', 'Started');
    }

    /**
     * Zatrzymaj pętlę gry.
     */
    stop() {
        if (!this._running) return;
        this._running = false;
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        Debug.info('game-loop', 'Stopped');
    }

    /**
     * Wstrzymaj pętlę (nie wywołuje updateFn, ale RAF działa).
     */
    pause() {
        this._paused = true;
        Debug.info('game-loop', 'Paused');
    }

    /**
     * Wznów pętlę po pauzie.
     */
    resume() {
        this._paused = false;
        this._lastTime = performance.now();
        Debug.info('game-loop', 'Resumed');
    }

    /**
     * Czy pętla jest uruchomiona.
     *
     * @returns {boolean}
     */
    get isRunning() {
        return this._running;
    }

    /**
     * Wewnętrzna metoda tick — wywoływana przez RAF.
     *
     * @param {number} now - Timestamp z requestAnimationFrame (ms)
     * @private
     */
    _tick(now) {
        if (!this._running) return;

        this._rafId = requestAnimationFrame(this._tick);

        if (this._paused) {
            this._lastTime = now;
            return;
        }

        let dt = (now - this._lastTime) / 1000;
        this._lastTime = now;

        // Clamp dt aby uniknąć skoków po alt-tab
        if (dt > this._maxDt) {
            dt = this._maxDt;
        }

        this._updateFn(dt);
    }
}

export default GameLoop;
