/**
 * Transform — komponent pozycji, rotacji i skali encji.
 *
 * Komponent = tylko dane, zero logiki.
 */

class Transform {
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    z;
    /** @type {number} */
    rotationY;
    /** @type {number} */
    scaleX;
    /** @type {number} */
    scaleY;
    /** @type {number} */
    scaleZ;

    /**
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @param {number} [rotationY=0]
     */
    constructor(x = 0, y = 0, z = 0, rotationY = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotationY = rotationY;
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;
    }
}

export default Transform;
