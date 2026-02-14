/**
 * RenderSystem — synchronizuje pozycje Three.js meshów z komponentami Transform.
 *
 * System = logika, operuje na encjach z Transform + Renderable.
 */

import Transform from '../components/transform.js';
import Renderable from '../components/renderable.js';

class RenderSystem {
    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        const entities = world.query([Transform, Renderable]);

        for (const entityId of entities) {
            const transform = world.getComponent(entityId, Transform);
            const renderable = world.getComponent(entityId, Renderable);

            if (renderable.mesh) {
                renderable.mesh.position.set(transform.x, transform.y, transform.z);
                renderable.mesh.rotation.y = transform.rotationY;
                renderable.mesh.scale.set(transform.scaleX, transform.scaleY, transform.scaleZ);
            }
        }
    }
}

export default RenderSystem;
