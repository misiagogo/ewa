/**
 * InputSystem — system ECS odczytujący input (desktop + mobile) i zapisujący do PlayerInput.
 *
 * Musi być uruchomiony PRZED MovementSystem w kolejności systemów.
 * Używa InputAdapter do obsługi klawiatury i dotyku.
 */

import PlayerInput from '../components/player-input.js';
import PlayerControlled from '../components/player-controlled.js';
import InputAdapter from '../input/input-adapter.js';

class InputSystem {
    /** @type {InputAdapter} */
    _adapter = new InputAdapter();

    /**
     * Inicjalizacja — podłącz InputAdapter (auto-detect platformy).
     */
    init() {
        this._adapter.init();
    }

    /**
     * Cleanup — odłącz InputAdapter.
     */
    dispose() {
        this._adapter.dispose();
    }

    /**
     * Czy platforma jest mobilna.
     *
     * @returns {boolean}
     */
    get isMobile() {
        return this._adapter.isMobile;
    }

    /**
     * Wykryta platforma.
     *
     * @returns {string}
     */
    get platform() {
        return this._adapter.platform;
    }

    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        const adapterInput = this._adapter.getInput();
        const entities = world.query([PlayerInput, PlayerControlled]);

        for (const entityId of entities) {
            const input = world.getComponent(entityId, PlayerInput);

            input.forward = adapterInput.forward;
            input.backward = adapterInput.backward;
            input.left = adapterInput.left;
            input.right = adapterInput.right;
            input.rotateLeft = adapterInput.rotateLeft;
            input.rotateRight = adapterInput.rotateRight;
        }
    }
}

export default InputSystem;
