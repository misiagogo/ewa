/**
 * Fabryka encji kota (lokalnego gracza).
 *
 * Tworzy encję z pełnym zestawem komponentów: Transform, Velocity,
 * CatConfig, Renderable, PlayerControlled.
 *
 * @example
 * const catId = createCatEntity(world, scene, THREE, { fur_color: '#ff8800', ... });
 */

import Transform from '../components/transform.js';
import Velocity from '../components/velocity.js';
import CatConfig from '../components/cat-config.js';
import Renderable from '../components/renderable.js';
import PlayerControlled from '../components/player-controlled.js';
import CatModelGenerator from '../generators/cat-model-generator.js';

/**
 * Utwórz encję kota lokalnego gracza.
 *
 * @param {import('../core/ecs.js').World} world - ECS World
 * @param {Object} scene - Three.js Scene
 * @param {Object} THREE - Three.js module
 * @param {Object} config - Konfiguracja kota (fur_color, pattern, eye_color, age, gender, name)
 * @param {number} [startX=0]
 * @param {number} [startY=0]
 * @param {number} [startZ=0]
 * @returns {number} Entity ID
 */
export function createCatEntity(world, scene, THREE, config, startX = 0, startY = 0, startZ = 0) {
    const entityId = world.createEntity();

    world.addComponent(entityId, new Transform(startX, startY, startZ));
    world.addComponent(entityId, new Velocity());
    world.addComponent(entityId, new CatConfig(config));
    world.addComponent(entityId, new PlayerControlled(true));

    const catGen = new CatModelGenerator(THREE);
    const mesh = catGen.create(config);
    scene.add(mesh);
    world.addComponent(entityId, new Renderable(mesh));

    return entityId;
}
