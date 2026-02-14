/**
 * StateMachine — zarządzanie stanami ekranów gry.
 *
 * Jeden stan aktywny w danym momencie. Każdy stan ma metody:
 * enter(data), exit(), update(dt).
 *
 * @example
 * const sm = new StateMachine();
 * sm.add('menu', new MenuScreen());
 * sm.add('game', new GameScreen());
 * sm.change('menu');
 */

import Debug from './debug.js';
import EventBus from './event-bus.js';

class StateMachine {
    /** @type {Map<string, Object>} */
    _states = new Map();

    /** @type {string|null} */
    _currentName = null;

    /** @type {Object|null} */
    _currentState = null;

    /**
     * Dodaj stan do maszyny.
     *
     * @param {string} name - Unikalna nazwa stanu
     * @param {Object} state - Obiekt stanu z metodami enter/exit/update
     */
    add(name, state) {
        this._states.set(name, state);
    }

    /**
     * Zmień aktywny stan.
     *
     * Wywołuje exit() na starym stanie i enter(data) na nowym.
     * Emituje event 'screen:changed'.
     *
     * @param {string} name - Nazwa nowego stanu
     * @param {*} [data=null] - Dane przekazywane do enter()
     */
    change(name, data = null) {
        if (!this._states.has(name)) {
            Debug.error('state-machine', `State '${name}' not found`);
            return;
        }

        const previousName = this._currentName;

        if (this._currentState && typeof this._currentState.exit === 'function') {
            this._currentState.exit();
        }

        this._currentName = name;
        this._currentState = this._states.get(name);

        if (typeof this._currentState.enter === 'function') {
            this._currentState.enter(data);
        }

        Debug.info('state-machine', `Changed: ${previousName} → ${name}`);
        EventBus.emit('screen:changed', { from: previousName, to: name });
    }

    /**
     * Aktualizuj aktywny stan (wywoływane co klatkę).
     *
     * @param {number} dt - Delta time w sekundach
     */
    update(dt) {
        if (this._currentState && typeof this._currentState.update === 'function') {
            this._currentState.update(dt);
        }
    }

    /**
     * Pobierz nazwę aktualnego stanu.
     *
     * @returns {string|null}
     */
    get current() {
        return this._currentName;
    }
}

export default StateMachine;
