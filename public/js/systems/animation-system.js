/**
 * AnimationSystem — system ECS animujący modele kotów.
 *
 * Proceduralne animacje: walk cycle (named leg groups), sprint, skok,
 * kołysanie ogona (segmenty), oddychanie, kołysanie ciała.
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

            this._animateLegs(renderable.mesh, isMoving, isSprinting, isAirborne);
            this._animateTail(renderable.mesh, isMoving, isSprinting);
            this._animateBody(renderable.mesh, isMoving, isSprinting, isAirborne);
        }
    }

    /**
     * Animacja łap — walk cycle z named leg groups.
     *
     * Diagonal gait: FL+BR razem, FR+BL razem (jak prawdziwy kot).
     * Sprint: szybszy cykl, większa amplituda.
     * Skok: łapy wyciągnięte.
     *
     * @param {Object} mesh
     * @param {boolean} isMoving
     * @param {boolean} isSprinting
     * @param {boolean} isAirborne
     * @private
     */
    _animateLegs(mesh, isMoving, isSprinting, isAirborne) {
        const legs = {};
        mesh.children.forEach((child) => {
            if (child.userData?.legName) {
                legs[child.userData.legName] = child;
            }
        });

        if (isAirborne) {
            // W powietrzu — łapy wyciągnięte do przodu/tyłu
            if (legs.legFL) legs.legFL.rotation.x = -0.4;
            if (legs.legFR) legs.legFR.rotation.x = -0.4;
            if (legs.legBL) legs.legBL.rotation.x = 0.5;
            if (legs.legBR) legs.legBR.rotation.x = 0.5;
            return;
        }

        if (!isMoving) {
            // Stoi — łapy w pozycji neutralnej, lekkie oddychanie
            if (legs.legFL) legs.legFL.rotation.x = 0;
            if (legs.legFR) legs.legFR.rotation.x = 0;
            if (legs.legBL) legs.legBL.rotation.x = 0;
            if (legs.legBR) legs.legBR.rotation.x = 0;
            return;
        }

        // Walk/run cycle — diagonal gait
        const freq = isSprinting ? 14 : 8;
        const amp = isSprinting ? 0.55 : 0.35;

        const phase = this._time * freq;

        // Diagonal: FL+BR w fazie, FR+BL w przeciwfazie
        if (legs.legFL) legs.legFL.rotation.x = Math.sin(phase) * amp;
        if (legs.legBR) legs.legBR.rotation.x = Math.sin(phase) * amp * 0.8;
        if (legs.legFR) legs.legFR.rotation.x = Math.sin(phase + Math.PI) * amp;
        if (legs.legBL) legs.legBL.rotation.x = Math.sin(phase + Math.PI) * amp * 0.8;
    }

    /**
     * Animacja ogona — kołysanie sinusoidalne z segmentów.
     *
     * @param {Object} mesh
     * @param {boolean} isMoving
     * @param {boolean} isSprinting
     * @private
     */
    _animateTail(mesh, isMoving, isSprinting) {
        const freq = isSprinting ? 10 : isMoving ? 6 : 2;
        const amp = isSprinting ? 0.35 : isMoving ? 0.2 : 0.1;

        mesh.children.forEach((child) => {
            if (child.userData?.tailSegment !== undefined) {
                const i = child.userData.tailSegment;
                // Każdy segment z opóźnieniem fazowym — efekt fali
                child.rotation.z = Math.sin(this._time * freq + i * 0.6) * amp * (1 + i * 0.15);
            }
        });
    }

    /**
     * Animacja ciała — kołysanie podczas ruchu, oddychanie w spoczynku.
     *
     * @param {Object} mesh
     * @param {boolean} isMoving
     * @param {boolean} isSprinting
     * @param {boolean} isAirborne
     * @private
     */
    _animateBody(mesh, isMoving, isSprinting, isAirborne) {
        if (isAirborne) {
            // W powietrzu — lekkie pochylenie do przodu
            mesh.rotation.x = -0.1;
            mesh.rotation.z = 0;
        } else if (isSprinting) {
            // Sprint — dynamiczne kołysanie
            mesh.rotation.z = Math.sin(this._time * 12) * 0.03;
            mesh.rotation.x = Math.sin(this._time * 14) * 0.015;
        } else if (isMoving) {
            // Chód — lekkie kołysanie
            mesh.rotation.z = Math.sin(this._time * 6) * 0.02;
            mesh.rotation.x = 0;
        } else {
            // Oddychanie
            mesh.rotation.z = Math.sin(this._time * 1.5) * 0.005;
            mesh.rotation.x = 0;
        }
    }
}

export default AnimationSystem;
