/**
 * Velocity — komponent prędkości encji.
 *
 * Komponent = tylko dane, zero logiki.
 */

class Velocity {
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    z;

    /**
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export default Velocity;
