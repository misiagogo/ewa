/**
 * Fabryka encji zdalnego kota (inny gracz w multiplayer).
 *
 * Tworzy encję z: Transform, CatConfig, Renderable, NetworkTransform.
 * BEZ PlayerControlled — sterowany przez sieć.
 *
 * @example
 * const remoteId = createRemoteCatEntity(world, scene, THREE, config, userId);
 */

import Transform from '../components/transform.js';
import CatConfig from '../components/cat-config.js';
import Renderable from '../components/renderable.js';
import { NetworkTransform } from '../systems/interpolation-system.js';
import CatModelGenerator from '../generators/cat-model-generator.js';

/**
 * Utwórz encję zdalnego kota.
 *
 * @param {import('../core/ecs.js').World} world
 * @param {Object} scene - Three.js Scene
 * @param {Object} THREE - Three.js module
 * @param {Object} config - Konfiguracja kota
 * @param {number} userId - ID użytkownika (serwer)
 * @param {number} [startX=0]
 * @param {number} [startY=0]
 * @param {number} [startZ=0]
 * @returns {Promise<number>} Entity ID
 */
export async function createRemoteCatEntity(world, scene, THREE, config, userId, startX = 0, startY = 0, startZ = 0) {
    const entityId = world.createEntity();

    world.addComponent(entityId, new Transform(startX, startY, startZ));
    world.addComponent(entityId, new CatConfig(config));
    world.addComponent(entityId, new NetworkTransform(startX, startY, startZ, 0));

    const catGen = new CatModelGenerator(THREE);
    const mesh = await catGen.create(config);
    mesh.userData.userId = userId;
    scene.add(mesh);
    world.addComponent(entityId, new Renderable(mesh));

    return entityId;
}
