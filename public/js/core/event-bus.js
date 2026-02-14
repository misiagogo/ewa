/**
 * EventBus — globalny system zdarzeń (pub/sub).
 *
 * Luźne wiązanie między modułami. Nazwy eventów w formacie 'category:action'.
 *
 * @example
 * EventBus.on('screen:changed', (data) => { ... });
 * EventBus.emit('screen:changed', { from: 'menu', to: 'game' });
 * EventBus.off('screen:changed', handler);
 */

import Debug from './debug.js';

class EventBus {
    /** @type {Map<string, Set<Function>>} */
    static _listeners = new Map();

    /**
     * Zarejestruj listener na event.
     *
     * @param {string} event - Nazwa eventu (np. 'screen:changed')
     * @param {Function} callback - Funkcja obsługi
     */
    static on(event, callback) {
        if (!EventBus._listeners.has(event)) {
            EventBus._listeners.set(event, new Set());
        }
        EventBus._listeners.get(event).add(callback);
    }

    /**
     * Wyrejestruj listener z eventu.
     *
     * @param {string} event - Nazwa eventu
     * @param {Function} callback - Funkcja do usunięcia
     */
    static off(event, callback) {
        const listeners = EventBus._listeners.get(event);
        if (listeners) {
            listeners.delete(callback);
        }
    }

    /**
     * Emituj event z danymi.
     *
     * @param {string} event - Nazwa eventu
     * @param {*} [data=null] - Dane przekazywane do listenerów
     */
    static emit(event, data = null) {
        Debug.debug('event-bus', `Emit: ${event}`, data);
        const listeners = EventBus._listeners.get(event);
        if (listeners) {
            listeners.forEach((callback) => {
                try {
                    callback(data);
                } catch (err) {
                    Debug.error('event-bus', `Error in listener for '${event}'`, {
                        error: err.message,
                    });
                }
            });
        }
    }

    /**
     * Zarejestruj listener jednorazowy (auto-off po pierwszym wywołaniu).
     *
     * @param {string} event - Nazwa eventu
     * @param {Function} callback - Funkcja obsługi
     */
    static once(event, callback) {
        const wrapper = (data) => {
            EventBus.off(event, wrapper);
            callback(data);
        };
        EventBus.on(event, wrapper);
    }

    /**
     * Usuń wszystkie listenery (reset).
     */
    static clear() {
        EventBus._listeners.clear();
    }
}

export default EventBus;
