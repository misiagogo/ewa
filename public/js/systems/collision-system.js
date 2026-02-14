/**
 * CollisionSystem — system ECS wykrywający kolizje gracza z obiektami (drzewa, skały).
 *
 * Prosty AABB/sphere collision — cofnij gracza jeśli wchodzi w obiekt.
 * Operuje na encjach z Transform + Velocity + PlayerControlled.
 */

import Transform from '../components/transform.js';
import Velocity from '../components/velocity.js';
import PlayerControlled from '../components/player-controlled.js';

/** @type {number} Promień kolizji gracza */
const PLAYER_RADIUS = 0.35;

class CollisionSystem {
    /** @type {Object|null} Three.js scene */
    _scene = null;

    /** @type {Array<{x: number, z: number, radius: number}>} Cache kolizji dekoracji */
    _colliders = [];

    /** @type {number} Czas od ostatniego odświeżenia cache */
    _cacheTimer = 0;

    /** @type {number} Interwał odświeżania cache (sekundy) */
    _cacheInterval = 2.0;

    /**
     * @param {Object} scene - Three.js scene
     */
    constructor(scene) {
        this._scene = scene;
    }

    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        // Odśwież cache kolizji co _cacheInterval sekund
        this._cacheTimer += dt;
        if (this._cacheTimer >= this._cacheInterval) {
            this._cacheTimer = 0;
            this._rebuildColliders();
        }

        const entities = world.query([Transform, Velocity, PlayerControlled]);

        for (const entityId of entities) {
            const transform = world.getComponent(entityId, Transform);
            const velocity = world.getComponent(entityId, Velocity);

            this._resolveCollisions(transform, velocity);
        }
    }

    /**
     * Przebuduj listę koliderów z obiektów na scenie.
     *
     * @private
     */
    _rebuildColliders() {
        this._colliders = [];
        if (!this._scene) return;

        this._scene.traverse((obj) => {
            if (obj.userData?.collider) {
                this._colliders.push({
                    x: obj.position.x,
                    z: obj.position.z,
                    radius: obj.userData.colliderRadius || 0.5,
                });
            }
        });
    }

    /**
     * Rozwiąż kolizje gracza z obiektami — push-out.
     *
     * @param {Transform} transform
     * @param {Velocity} velocity
     * @private
     */
    _resolveCollisions(transform, velocity) {
        const px = transform.x;
        const pz = transform.z;

        for (const col of this._colliders) {
            const dx = px - col.x;
            const dz = pz - col.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const minDist = PLAYER_RADIUS + col.radius;

            if (dist < minDist && dist > 0.001) {
                // Push-out — odsuń gracza od obiektu
                const overlap = minDist - dist;
                const nx = dx / dist;
                const nz = dz / dist;

                transform.x += nx * overlap;
                transform.z += nz * overlap;

                // Wyzeruj velocity w kierunku kolizji
                const dot = velocity.x * nx + velocity.z * nz;
                if (dot < 0) {
                    velocity.x -= dot * nx;
                    velocity.z -= dot * nz;
                }
            }
        }
    }
}

export default CollisionSystem;
