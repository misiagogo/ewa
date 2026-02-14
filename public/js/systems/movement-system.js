/**
 * MovementSystem — konwertuje PlayerInput na Velocity/rotację i aplikuje ruch.
 *
 * Obsługuje: chodzenie, sprint (po 1.5s biegu), skok (spacja), grawitację.
 * Waga kota wpływa na prędkość (cięższy = wolniejszy) i skok (cięższy = niższy).
 */

import Transform from '../components/transform.js';
import Velocity from '../components/velocity.js';
import PlayerInput from '../components/player-input.js';
import CatConfig from '../components/cat-config.js';

/** @type {number} Bazowa prędkość chodu */
const BASE_WALK_SPEED = 5;

/** @type {number} Mnożnik sprintu */
const SPRINT_MULTIPLIER = 1.8;

/** @type {number} Czas ciągłego biegu do przodu aby aktywować sprint (sekundy) */
const SPRINT_THRESHOLD = 1.5;

/** @type {number} Bazowa siła skoku */
const BASE_JUMP_FORCE = 6;

/** @type {number} Grawitacja */
const GRAVITY = -18;

/** @type {number} */
const ROT_SPEED = 2.5;

class MovementSystem {
    /** @type {Map<number, {forwardTime: number, isGrounded: boolean, isSprinting: boolean}>} Stan per encja */
    _states = new Map();

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

            if (input) {
                // Stan per encja
                if (!this._states.has(entityId)) {
                    this._states.set(entityId, { forwardTime: 0, isGrounded: true, isSprinting: false });
                }
                const state = this._states.get(entityId);

                // Waga kota — wpływ na prędkość i skok
                const catConfig = world.getComponent(entityId, CatConfig);
                const weight = catConfig ? catConfig.weight : 4.5;
                const weightFactor = 1.0 - ((weight - 2) / 10) * 0.3; // 1.0 (2kg) → 0.7 (12kg)

                // Obrót
                if (input.rotateLeft) {
                    transform.rotationY += ROT_SPEED * dt;
                }
                if (input.rotateRight) {
                    transform.rotationY -= ROT_SPEED * dt;
                }

                // Sprint timer
                if (input.forward && !input.backward) {
                    state.forwardTime += dt;
                } else {
                    state.forwardTime = 0;
                }
                state.isSprinting = state.forwardTime >= SPRINT_THRESHOLD;

                // Prędkość
                const speed = (state.isSprinting ? BASE_WALK_SPEED * SPRINT_MULTIPLIER : BASE_WALK_SPEED) * weightFactor;

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

                // Normalizuj
                const len = Math.sqrt(vx * vx + vz * vz);
                if (len > 0) {
                    vx = (vx / len) * speed;
                    vz = (vz / len) * speed;
                }

                velocity.x = vx;
                velocity.z = vz;

                // Skok
                if (input.jump && state.isGrounded) {
                    const jumpForce = BASE_JUMP_FORCE * weightFactor;
                    velocity.y = jumpForce;
                    state.isGrounded = false;
                }

                // Grawitacja
                if (!state.isGrounded) {
                    velocity.y += GRAVITY * dt;
                }
            }

            // Aplikuj velocity → transform
            transform.x += velocity.x * dt;
            transform.y += velocity.y * dt;
            transform.z += velocity.z * dt;
        }
    }

    /**
     * Oznacz encję jako stojącą na ziemi (wywoływane z game-screen po terrain height).
     *
     * @param {number} entityId
     * @param {boolean} grounded
     */
    setGrounded(entityId, grounded) {
        const state = this._states.get(entityId);
        if (state) {
            state.isGrounded = grounded;
        }
    }

    /**
     * Czy encja sprintuje.
     *
     * @param {number} entityId
     * @returns {boolean}
     */
    isSprinting(entityId) {
        const state = this._states.get(entityId);
        return state ? state.isSprinting : false;
    }
}

export default MovementSystem;
