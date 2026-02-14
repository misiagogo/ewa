/**
 * PlayerInput — komponent przechowujący stan inputu gracza.
 *
 * Komponent = tylko dane, zero logiki.
 * Ujednolicony format niezależny od platformy (desktop/mobile).
 */

class PlayerInput {
    /** @type {boolean} */
    forward = false;
    /** @type {boolean} */
    backward = false;
    /** @type {boolean} */
    left = false;
    /** @type {boolean} */
    right = false;
    /** @type {number} Obrót kamery (delta) */
    rotateLeft = false;
    /** @type {boolean} */
    rotateRight = false;

    constructor() {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.rotateLeft = false;
        this.rotateRight = false;
    }
}

export default PlayerInput;
