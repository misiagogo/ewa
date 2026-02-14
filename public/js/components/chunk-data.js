/**
 * ChunkData — komponent ECS przechowujący dane chunka.
 *
 * Komponent = tylko dane, zero logiki.
 */

class ChunkData {
    /** @type {number} */
    chunkX;
    /** @type {number} */
    chunkZ;
    /** @type {number} */
    currentSegments;
    /** @type {boolean} */
    loaded;

    /**
     * @param {number} [chunkX=0]
     * @param {number} [chunkZ=0]
     * @param {number} [segments=32]
     */
    constructor(chunkX = 0, chunkZ = 0, segments = 32) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.currentSegments = segments;
        this.loaded = false;
    }
}

export default ChunkData;
