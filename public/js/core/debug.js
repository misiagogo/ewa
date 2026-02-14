/**
 * Klasa Debug — jedyny sposób logowania w aplikacji.
 *
 * Nigdy nie używaj console.log bezpośrednio — zawsze przez Debug.
 * W trybie production logi debug/info są wyciszane.
 * Logi mogą być buforowane i wysyłane batchem do backendu.
 *
 * @example
 * Debug.info('gameplay', 'Player spawned', { x: 10, z: 20 });
 * Debug.error('network', 'WebSocket disconnected', { code: 1006 });
 */

const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warning: 2,
    error: 3,
};

class Debug {
    /** @type {boolean} */
    static enabled = true;

    /** @type {string} */
    static minLevel = 'debug';

    /** @type {Array<Object>} */
    static _buffer = [];

    /** @type {number} */
    static _maxBufferSize = 50;

    /** @type {Function|null} */
    static _flushCallback = null;

    /**
     * Inicjalizacja debuggera.
     *
     * @param {Object} options
     * @param {boolean} options.enabled - Czy logowanie jest włączone
     * @param {string} options.minLevel - Minimalny poziom logowania (debug|info|warning|error)
     * @param {number} [options.maxBufferSize=50] - Max logów w buforze przed flush
     * @param {Function} [options.flushCallback] - Callback do wysyłania logów na backend
     */
    static init(options = {}) {
        Debug.enabled = options.enabled !== undefined ? options.enabled : true;
        Debug.minLevel = options.minLevel || 'debug';
        Debug._maxBufferSize = options.maxBufferSize || 50;
        Debug._flushCallback = options.flushCallback || null;
    }

    /**
     * Log na poziomie debug.
     *
     * @param {string} category - Kategoria (gameplay, network, save, etc.)
     * @param {string} message - Treść logu
     * @param {Object} [context=null] - Dodatkowe dane
     */
    static debug(category, message, context = null) {
        Debug._log('debug', category, message, context);
    }

    /**
     * Log na poziomie info.
     *
     * @param {string} category - Kategoria
     * @param {string} message - Treść logu
     * @param {Object} [context=null] - Dodatkowe dane
     */
    static info(category, message, context = null) {
        Debug._log('info', category, message, context);
    }

    /**
     * Log na poziomie warning.
     *
     * @param {string} category - Kategoria
     * @param {string} message - Treść logu
     * @param {Object} [context=null] - Dodatkowe dane
     */
    static warning(category, message, context = null) {
        Debug._log('warning', category, message, context);
    }

    /**
     * Log na poziomie error.
     *
     * @param {string} category - Kategoria
     * @param {string} message - Treść logu
     * @param {Object} [context=null] - Dodatkowe dane
     */
    static error(category, message, context = null) {
        Debug._log('error', category, message, context);
    }

    /**
     * Wymuś wysłanie buforowanych logów.
     */
    static flush() {
        if (Debug._buffer.length === 0) return;
        if (Debug._flushCallback) {
            Debug._flushCallback([...Debug._buffer]);
        }
        Debug._buffer = [];
    }

    /**
     * Wewnętrzna metoda logowania.
     *
     * @param {string} level
     * @param {string} category
     * @param {string} message
     * @param {Object|null} context
     * @private
     */
    static _log(level, category, message, context) {
        if (!Debug.enabled) return;
        if (LOG_LEVELS[level] < LOG_LEVELS[Debug.minLevel]) return;

        const entry = {
            level,
            category,
            message,
            context,
            timestamp: new Date().toISOString(),
        };

        // Wyświetl w konsoli (tylko w trybie debug)
        const prefix = `[${level.toUpperCase()}][${category}]`;
        switch (level) {
            case 'debug':
                console.debug(prefix, message, context || '');
                break;
            case 'info':
                console.info(prefix, message, context || '');
                break;
            case 'warning':
                console.warn(prefix, message, context || '');
                break;
            case 'error':
                console.error(prefix, message, context || '');
                break;
        }

        // Buforuj do wysłania na backend
        Debug._buffer.push(entry);
        if (Debug._buffer.length >= Debug._maxBufferSize) {
            Debug.flush();
        }
    }
}

export default Debug;
