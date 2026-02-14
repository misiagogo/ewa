/**
 * LodManager — Level of Detail per chunk.
 *
 * Aktualizuje rozdzielczość geometrii chunków wg odległości od gracza.
 * 3 poziomy LOD zdefiniowane w WorldConfig.LOD_LEVELS.
 */

import WorldConfig from './world-config.js';

class LodManager {
    /**
     * Oblicz poziom LOD dla chunka na podstawie odległości.
     *
     * @param {number} chunkX - Pozycja chunka X
     * @param {number} chunkZ - Pozycja chunka Z
     * @param {number} playerChunkX - Pozycja gracza w chunkach X
     * @param {number} playerChunkZ - Pozycja gracza w chunkach Z
     * @returns {number} Liczba segmentów geometrii
     */
    static getSegments(chunkX, chunkZ, playerChunkX, playerChunkZ) {
        const dist = Math.max(
            Math.abs(chunkX - playerChunkX),
            Math.abs(chunkZ - playerChunkZ)
        );

        for (const level of WorldConfig.LOD_LEVELS) {
            if (dist <= level.distance) {
                return level.segments;
            }
        }

        // Najniższy LOD
        return WorldConfig.LOD_LEVELS[WorldConfig.LOD_LEVELS.length - 1].segments;
    }

    /**
     * Aktualizuj LOD załadowanych chunków.
     *
     * @param {number} playerChunkX
     * @param {number} playerChunkZ
     * @param {Map<string, Object>} chunks - Mapa załadowanych chunków
     */
    update(playerChunkX, playerChunkZ, chunks) {
        for (const [key, chunkData] of chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const neededSegments = LodManager.getSegments(cx, cz, playerChunkX, playerChunkZ);

            if (chunkData.currentSegments !== neededSegments && chunkData.rebuildFn) {
                chunkData.rebuildFn(neededSegments);
                chunkData.currentSegments = neededSegments;
            }
        }
    }
}

export default LodManager;
