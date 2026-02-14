/**
 * Fabryka encji chunka terenu.
 *
 * Tworzy encję ECS z komponentami: Transform, Renderable, ChunkData.
 *
 * @example
 * const chunkId = createChunkEntity(world, scene, terrainMesh, chunkX, chunkZ);
 */

import Transform from '../components/transform.js';
import Renderable from '../components/renderable.js';
import ChunkData from '../components/chunk-data.js';
import WorldConfig from '../world/world-config.js';

/**
 * Utwórz encję chunka.
 *
 * @param {import('../core/ecs.js').World} world
 * @param {Object} scene - Three.js Scene
 * @param {Object} mesh - Three.js Mesh terenu
 * @param {number} chunkX
 * @param {number} chunkZ
 * @param {number} [segments=32]
 * @returns {number} Entity ID
 */
export function createChunkEntity(world, scene, mesh, chunkX, chunkZ, segments = 32) {
    const entityId = world.createEntity();

    const worldX = chunkX * WorldConfig.CHUNK_SIZE;
    const worldZ = chunkZ * WorldConfig.CHUNK_SIZE;

    world.addComponent(entityId, new Transform(worldX, 0, worldZ));
    world.addComponent(entityId, new ChunkData(chunkX, chunkZ, segments));

    if (mesh) {
        scene.add(mesh);
        world.addComponent(entityId, new Renderable(mesh));
    }

    return entityId;
}
