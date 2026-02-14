/**
 * KeyboardHandler — obsługa klawiatury (desktop).
 *
 * Śledzi stan klawiszy i zwraca ujednolicony obiekt inputu.
 * Mapowanie klawiszy z InputConfig.
 */

import InputConfig from './input-config.js';

class KeyboardHandler {
    /** @type {Object<string, boolean>} */
    _keys = {};

    /** @type {Function|null} */
    _onKeyDown = null;

    /** @type {Function|null} */
    _onKeyUp = null;

    /**
     * Inicjalizacja — podłącz listenery.
     */
    init() {
        this._onKeyDown = (e) => {
            this._keys[e.code] = true;
        };
        this._onKeyUp = (e) => {
            this._keys[e.code] = false;
        };
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    /**
     * Pobierz ujednolicony obiekt inputu.
     *
     * @returns {{ forward: boolean, backward: boolean, left: boolean, right: boolean, rotateLeft: boolean, rotateRight: boolean }}
     */
    getInput() {
        const km = InputConfig.keyboard;

        return {
            forward: this._anyPressed(km.forward),
            backward: this._anyPressed(km.backward),
            left: this._anyPressed(km.left),
            right: this._anyPressed(km.right),
            rotateLeft: this._anyPressed(km.rotateLeft),
            rotateRight: this._anyPressed(km.rotateRight),
        };
    }

    /**
     * Sprawdź czy którykolwiek klawisz z listy jest wciśnięty.
     *
     * @param {Array<string>} codes
     * @returns {boolean}
     * @private
     */
    _anyPressed(codes) {
        if (!codes) return false;
        for (const code of codes) {
            if (this._keys[code]) return true;
        }
        return false;
    }

    /**
     * Cleanup — odłącz listenery.
     */
    dispose() {
        if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
        if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp);
        this._keys = {};
    }
}

export default KeyboardHandler;
