/**
 * AnimationSystem — system ECS animujący modele kotów.
 *
 * Proceduralne animacje na załadowanym modelu GLB:
 * - Chód: kołysanie ciała, bounce Y
 * - Sprint: szybsze kołysanie, większa amplituda
 * - Skok: pochylenie do przodu
 * - Idle: oddychanie (lekkie skalowanie Y)
 *
 * Operuje na encjach z Transform + Velocity + Renderable.
 */

import Transform from '../components/transform.js';
import Velocity from '../components/velocity.js';
import Renderable from '../components/renderable.js';

class AnimationSystem {
    /** @type {number} Akumulowany czas animacji */
    _time = 0;

    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        this._time += dt;

        const entities = world.query([Transform, Velocity, Renderable]);

        for (const entityId of entities) {
            const velocity = world.getComponent(entityId, Velocity);
            const renderable = world.getComponent(entityId, Renderable);

            if (!renderable.mesh || renderable.mesh.userData?.type !== 'cat') continue;

            const speedXZ = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
            const isMoving = speedXZ > 0.1;
            const isSprinting = speedXZ > 7;
            const isAirborne = velocity.y > 0.5 || velocity.y < -0.5;

            this._animateModel(renderable.mesh, isMoving, isSprinting, isAirborne);
        }
    }

    /**
     * Animacja modelu kota — kołysanie, bounce, oddychanie.
     *
     * @param {Object} mesh - Three.js Group (model kota)
     * @param {boolean} isMoving
     * @param {boolean} isSprinting
     * @param {boolean} isAirborne
     * @private
     */
    _animateModel(mesh, isMoving, isSprinting, isAirborne) {
        // Znajdź wewnętrzny model (child[0] to sklonowany GLB)
        const model = mesh.children[0] || mesh;

        if (isAirborne) {
            // W powietrzu — pochylenie do przodu, nogi w tył
            mesh.rotation.x = -0.15;
            mesh.rotation.z = 0;
            model.position.y = 0;
            return;
        }

        if (isSprinting) {
            // Sprint — szybki bounce + kołysanie
            const bounceFreq = 14;
            const bounceAmp = 0.04;
            const swayAmp = 0.04;

            model.position.y = Math.abs(Math.sin(this._time * bounceFreq)) * bounceAmp;
            mesh.rotation.z = Math.sin(this._time * bounceFreq * 0.5) * swayAmp;
            mesh.rotation.x = Math.sin(this._time * bounceFreq) * 0.02;
        } else if (isMoving) {
            // Chód — wolniejszy bounce + kołysanie
            const bounceFreq = 8;
            const bounceAmp = 0.025;
            const swayAmp = 0.025;

            model.position.y = Math.abs(Math.sin(this._time * bounceFreq)) * bounceAmp;
            mesh.rotation.z = Math.sin(this._time * bounceFreq * 0.5) * swayAmp;
            mesh.rotation.x = 0;
        } else {
            // Idle — oddychanie (lekkie skalowanie + kołysanie)
            const breathFreq = 1.5;
            const breathAmp = 0.008;

            model.position.y = 0;
            mesh.rotation.z = Math.sin(this._time * breathFreq) * breathAmp;
            mesh.rotation.x = 0;

            // Oddychanie — lekkie pulsowanie skali Y
            const breathScale = 1.0 + Math.sin(this._time * breathFreq) * 0.005;
            model.scale.y = breathScale;
        }
    }
}

export default AnimationSystem;
