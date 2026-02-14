/**
 * CameraTarget — marker komponent: encja śledzona przez kamerę.
 *
 * Komponent = tylko dane, zero logiki.
 */

class CameraTarget {
    /** @type {number} Odległość kamery za encją */
    distance;
    /** @type {number} Wysokość kamery nad encją */
    height;
    /** @type {number} Szybkość interpolacji kamery (0-1) */
    smoothSpeed;

    /**
     * @param {number} [distance=8]
     * @param {number} [height=5]
     * @param {number} [smoothSpeed=0.05]
     */
    constructor(distance = 8, height = 5, smoothSpeed = 0.05) {
        this.distance = distance;
        this.height = height;
        this.smoothSpeed = smoothSpeed;
    }
}

export default CameraTarget;
