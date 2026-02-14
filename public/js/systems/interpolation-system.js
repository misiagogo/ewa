/**
 * InterpolationSystem — interpolacja pozycji zdalnych graczy.
 *
 * Wygładza ruch innych graczy między otrzymanymi pakietami sieciowymi.
 * Działa tylko na encjach BEZ PlayerControlled (zdalni gracze).
 */

import Transform from '../components/transform.js';
import Renderable from '../components/renderable.js';
import { lerp } from '../utils/math-utils.js';

/**
 * NetworkTransform — komponent przechowujący docelową pozycję z serwera.
 */
class NetworkTransform {
    /** @type {number} */
    targetX = 0;
    /** @type {number} */
    targetY = 0;
    /** @type {number} */
    targetZ = 0;
    /** @type {number} */
    targetRotY = 0;
    /** @type {number} Szybkość interpolacji (0-1 per klatkę) */
    lerpSpeed = 0.15;

    /**
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @param {number} [rotY=0]
     */
    constructor(x = 0, y = 0, z = 0, rotY = 0) {
        this.targetX = x;
        this.targetY = y;
        this.targetZ = z;
        this.targetRotY = rotY;
    }

    /**
     * Ustaw nową docelową pozycję (z pakietu sieciowego).
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} rotY
     */
    setTarget(x, y, z, rotY) {
        this.targetX = x;
        this.targetY = y;
        this.targetZ = z;
        this.targetRotY = rotY;
    }
}

class InterpolationSystem {
    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        const entities = world.query([Transform, NetworkTransform]);

        for (const entityId of entities) {
            const transform = world.getComponent(entityId, Transform);
            const netTransform = world.getComponent(entityId, NetworkTransform);

            transform.x = lerp(transform.x, netTransform.targetX, netTransform.lerpSpeed);
            transform.y = lerp(transform.y, netTransform.targetY, netTransform.lerpSpeed);
            transform.z = lerp(transform.z, netTransform.targetZ, netTransform.lerpSpeed);
            transform.rotationY = lerp(transform.rotationY, netTransform.targetRotY, netTransform.lerpSpeed);
        }
    }
}

export { NetworkTransform, InterpolationSystem };
