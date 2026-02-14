/**
 * InputAdapter — auto-detect urządzenia i ujednolicony input.
 *
 * Wykrywa desktop vs mobile vs tablet.
 * Podłącza odpowiedni handler (KeyboardHandler lub TouchHandler).
 * Zwraca ujednolicony obiekt inputu niezależny od platformy.
 *
 * Nie sprawdzaj platformy poza tym plikiem.
 */

import Debug from '../core/debug.js';
import KeyboardHandler from './keyboard-handler.js';
import TouchHandler from './touch-handler.js';

class InputAdapter {
    /** @type {KeyboardHandler|null} */
    _keyboardHandler = null;

    /** @type {TouchHandler|null} */
    _touchHandler = null;

    /** @type {string} 'desktop' | 'mobile' | 'tablet' */
    _platform = 'desktop';

    /**
     * Inicjalizacja — wykryj platformę i podłącz handler.
     */
    init() {
        this._platform = this._detectPlatform();

        if (this._platform === 'desktop') {
            this._keyboardHandler = new KeyboardHandler();
            this._keyboardHandler.init();
            Debug.info('input-adapter', 'Platform: desktop (keyboard)');
        } else {
            this._touchHandler = new TouchHandler();
            this._touchHandler.init();

            // Na mobile też podłącz klawiaturę (Bluetooth keyboard)
            this._keyboardHandler = new KeyboardHandler();
            this._keyboardHandler.init();
            Debug.info('input-adapter', `Platform: ${this._platform} (touch + keyboard fallback)`);
        }
    }

    /**
     * Pobierz ujednolicony obiekt inputu.
     *
     * Łączy input z obu handlerów (OR logic).
     *
     * @returns {{ forward: boolean, backward: boolean, left: boolean, right: boolean, rotateLeft: boolean, rotateRight: boolean }}
     */
    getInput() {
        const kb = this._keyboardHandler ? this._keyboardHandler.getInput() : {};
        const touch = this._touchHandler ? this._touchHandler.getInput() : {};

        return {
            forward: !!(kb.forward || touch.forward),
            backward: !!(kb.backward || touch.backward),
            left: !!(kb.left || touch.left),
            right: !!(kb.right || touch.right),
            rotateLeft: !!(kb.rotateLeft || touch.rotateLeft),
            rotateRight: !!(kb.rotateRight || touch.rotateRight),
            jump: !!(kb.jump || touch.jump),
        };
    }

    /**
     * Wykryj platformę.
     *
     * @returns {string}
     * @private
     */
    _detectPlatform() {
        const ua = navigator.userAgent || '';
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Capacitor
        if (typeof window.Capacitor !== 'undefined') {
            const platform = window.Capacitor.getPlatform?.() || 'web';
            if (platform === 'android' || platform === 'ios') {
                return 'mobile';
            }
        }

        // Tablet detection
        if (hasTouchScreen && Math.min(window.innerWidth, window.innerHeight) > 600) {
            return 'tablet';
        }

        // Mobile detection
        if (hasTouchScreen && /Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
            return 'mobile';
        }

        return 'desktop';
    }

    /**
     * Pobierz wykrytą platformę.
     *
     * @returns {string}
     */
    get platform() {
        return this._platform;
    }

    /**
     * Czy platforma jest mobilna (mobile lub tablet).
     *
     * @returns {boolean}
     */
    get isMobile() {
        return this._platform === 'mobile' || this._platform === 'tablet';
    }

    /**
     * Cleanup.
     */
    dispose() {
        if (this._keyboardHandler) {
            this._keyboardHandler.dispose();
            this._keyboardHandler = null;
        }
        if (this._touchHandler) {
            this._touchHandler.dispose();
            this._touchHandler = null;
        }
    }
}

export default InputAdapter;
