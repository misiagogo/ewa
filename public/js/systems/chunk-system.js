/**
 * ChunkSystem — system ECS zarządzający chunkami w otwartym świecie.
 *
 * Śledzi encję gracza (PlayerControlled + Transform) i deleguje
 * ładowanie/usuwanie chunków do ChunkManager.
 */

import Transform from '../components/transform.js';
import PlayerControlled from '../components/player-controlled.js';

class ChunkSystem {
    /** @type {import('../world/chunk-manager.js').default|null} */
    _chunkManager = null;

    /** @type {number} */
    _viewDistance;

    /**
     * @param {Object} chunkManager - ChunkManager instance
     * @param {number} [viewDistance=5]
     */
    constructor(chunkManager, viewDistance = 5) {
        this._chunkManager = chunkManager;
        this._viewDistance = viewDistance;
    }

    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        if (!this._chunkManager) return;

        const entities = world.query([Transform, PlayerControlled]);

        for (const entityId of entities) {
            const pc = world.getComponent(entityId, PlayerControlled);
            if (!pc.isLocal) continue;

            const transform = world.getComponent(entityId, Transform);
            this._chunkManager.update(transform.x, transform.z, this._viewDistance);
            break;
        }
    }
}

export default ChunkSystem;
