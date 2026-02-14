/**
 * TouchHandler — obsługa dotykowa (mobile) z nipplejs virtual joystick.
 *
 * Lewy joystick → ruch (forward/backward/strafe).
 * Prawy obszar → obrót kamery (swipe).
 * Zwraca ujednolicony obiekt inputu.
 */

import InputConfig from './input-config.js';
import Debug from '../core/debug.js';

class TouchHandler {
    /** @type {Object|null} nipplejs manager (lewy joystick) */
    _moveJoystick = null;

    /** @type {Object} Aktualny stan joysticka ruchu */
    _moveState = { forward: false, backward: false, left: false, right: false };

    /** @type {boolean} */
    _rotateLeft = false;

    /** @type {boolean} */
    _rotateRight = false;

    /** @type {HTMLElement|null} Kontener lewego joysticka */
    _moveZoneEl = null;

    /** @type {HTMLElement|null} Kontener prawego joysticka */
    _cameraZoneEl = null;

    /** @type {number} Ostatnia pozycja X dotyku kamery */
    _lastCameraTouchX = 0;

    /**
     * Inicjalizacja — tworzy strefy dotykowe i joystick.
     *
     * Wymaga załadowanego nipplejs na stronie.
     */
    init() {
        // Strefa lewego joysticka (ruch)
        this._moveZoneEl = document.createElement('div');
        this._moveZoneEl.id = 'touch-move-zone';
        this._moveZoneEl.className = 'touch-zone touch-zone-left';
        document.body.appendChild(this._moveZoneEl);

        // Strefa prawego joysticka (kamera)
        this._cameraZoneEl = document.createElement('div');
        this._cameraZoneEl.id = 'touch-camera-zone';
        this._cameraZoneEl.className = 'touch-zone touch-zone-right';
        document.body.appendChild(this._cameraZoneEl);

        // nipplejs — lewy joystick
        if (typeof nipplejs !== 'undefined') {
            this._moveJoystick = nipplejs.create({
                zone: this._moveZoneEl,
                mode: 'static',
                position: { left: '80px', bottom: '80px' },
                color: 'rgba(233, 69, 96, 0.5)',
                size: 120,
            });

            this._moveJoystick.on('move', (evt, data) => {
                this._onMoveJoystick(data);
            });

            this._moveJoystick.on('end', () => {
                this._moveState = { forward: false, backward: false, left: false, right: false };
            });

            Debug.info('touch-handler', 'nipplejs joystick created');
        } else {
            Debug.warning('touch-handler', 'nipplejs not loaded — touch controls disabled');
        }

        // Prawy obszar — swipe do obrotu
        this._cameraZoneEl.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this._lastCameraTouchX = e.touches[0].clientX;
            }
        });

        this._cameraZoneEl.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const dx = e.touches[0].clientX - this._lastCameraTouchX;
                this._lastCameraTouchX = e.touches[0].clientX;

                const threshold = 2;
                this._rotateLeft = dx < -threshold;
                this._rotateRight = dx > threshold;
            }
        }, { passive: false });

        this._cameraZoneEl.addEventListener('touchend', () => {
            this._rotateLeft = false;
            this._rotateRight = false;
        });
    }

    /**
     * Callback joysticka ruchu.
     *
     * @param {Object} data - nipplejs data { angle, distance, force }
     * @private
     */
    _onMoveJoystick(data) {
        const deadzone = InputConfig.touch.deadzone;
        const force = data.force || 0;

        if (force < deadzone) {
            this._moveState = { forward: false, backward: false, left: false, right: false };
            return;
        }

        const angle = data.angle?.degree || 0;

        // Konwertuj kąt na kierunki (0° = prawo, 90° = góra, 180° = lewo, 270° = dół)
        this._moveState.forward = angle > 30 && angle < 150;
        this._moveState.backward = angle > 210 && angle < 330;
        this._moveState.left = angle > 120 && angle < 240;
        this._moveState.right = (angle < 60 || angle > 300);
    }

    /**
     * Pobierz ujednolicony obiekt inputu.
     *
     * @returns {{ forward: boolean, backward: boolean, left: boolean, right: boolean, rotateLeft: boolean, rotateRight: boolean }}
     */
    getInput() {
        return {
            forward: this._moveState.forward,
            backward: this._moveState.backward,
            left: this._moveState.left,
            right: this._moveState.right,
            rotateLeft: this._rotateLeft,
            rotateRight: this._rotateRight,
        };
    }

    /**
     * Cleanup.
     */
    dispose() {
        if (this._moveJoystick) {
            this._moveJoystick.destroy();
            this._moveJoystick = null;
        }
        if (this._moveZoneEl) {
            this._moveZoneEl.remove();
            this._moveZoneEl = null;
        }
        if (this._cameraZoneEl) {
            this._cameraZoneEl.remove();
            this._cameraZoneEl = null;
        }
    }
}

export default TouchHandler;
