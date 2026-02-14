/**
 * Fabryka encji dekoracji (drzewo, skała).
 *
 * Tworzy encję ECS z komponentami: Transform, Renderable.
 *
 * @example
 * const decoId = createDecorationEntity(world, scene, mesh, x, y, z);
 */

import Transform from '../components/transform.js';
import Renderable from '../components/renderable.js';

/**
 * Utwórz encję dekoracji.
 *
 * @param {import('../core/ecs.js').World} world
 * @param {Object} scene - Three.js Scene
 * @param {Object} mesh - Three.js Mesh/Group dekoracji
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {number} Entity ID
 */
export function createDecorationEntity(world, scene, mesh, x, y, z) {
    const entityId = world.createEntity();

    world.addComponent(entityId, new Transform(x, y, z));

    if (mesh) {
        scene.add(mesh);
        world.addComponent(entityId, new Renderable(mesh));
    }

    return entityId;
}
