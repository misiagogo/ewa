/**
 * MovementSystem — konwertuje PlayerInput na Velocity/rotację i aplikuje ruch.
 *
 * System = logika, operuje na encjach z Transform + Velocity.
 * Dla encji z PlayerInput: czyta input → ustawia velocity + rotację.
 * Dla wszystkich: aplikuje velocity → transform.
 */

import Transform from '../components/transform.js';
import Velocity from '../components/velocity.js';
import PlayerInput from '../components/player-input.js';

/** @type {number} */
const MOVE_SPEED = 8;

/** @type {number} */
const ROT_SPEED = 2;

class MovementSystem {
    /**
     * @param {number} dt - Delta time w sekundach
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        const entities = world.query([Transform, Velocity]);

        for (const entityId of entities) {
            const transform = world.getComponent(entityId, Transform);
            const velocity = world.getComponent(entityId, Velocity);
            const input = world.getComponent(entityId, PlayerInput);

            // Jeśli encja ma PlayerInput — oblicz velocity z inputu
            if (input) {
                // Obrót
                if (input.rotateLeft) {
                    transform.rotationY += ROT_SPEED * dt;
                }
                if (input.rotateRight) {
                    transform.rotationY -= ROT_SPEED * dt;
                }

                // Kierunki wg rotacji
                const fwdX = Math.sin(transform.rotationY);
                const fwdZ = Math.cos(transform.rotationY);
                const rightX = Math.cos(transform.rotationY);
                const rightZ = -Math.sin(transform.rotationY);

                let vx = 0;
                let vz = 0;

                if (input.forward) { vx += fwdX; vz += fwdZ; }
                if (input.backward) { vx -= fwdX; vz -= fwdZ; }
                if (input.left) { vx -= rightX; vz -= rightZ; }
                if (input.right) { vx += rightX; vz += rightZ; }

                // Normalizuj jeśli ruch po skosie
                const len = Math.sqrt(vx * vx + vz * vz);
                if (len > 0) {
                    vx = (vx / len) * MOVE_SPEED;
                    vz = (vz / len) * MOVE_SPEED;
                }

                velocity.x = vx;
                velocity.z = vz;
            }

            // Aplikuj velocity → transform
            transform.x += velocity.x * dt;
            transform.y += velocity.y * dt;
            transform.z += velocity.z * dt;
        }
    }
}

export default MovementSystem;
