/**
 * AnimationSystem — system ECS animujący modele kotów.
 *
 * Proste animacje proceduralne: kołysanie ogona, ruch łap podczas chodzenia.
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

            const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
            const isMoving = speed > 0.1;

            this._animateTail(renderable.mesh, isMoving);
            this._animatePaws(renderable.mesh, isMoving);
            this._animateBody(renderable.mesh, isMoving);
        }
    }

    /**
     * Animacja ogona — kołysanie sinusoidalne.
     *
     * @param {Object} mesh - Three.js Group (model kota)
     * @param {boolean} isMoving
     * @private
     */
    _animateTail(mesh, isMoving) {
        const tail = mesh.children.find((c) =>
            c.geometry?.type === 'CylinderGeometry' && c.position.z < -0.4
        );
        if (tail) {
            const freq = isMoving ? 8 : 2;
            const amp = isMoving ? 0.3 : 0.15;
            tail.rotation.z = Math.sin(this._time * freq) * amp;
        }
    }

    /**
     * Animacja łap — ruch przód/tył podczas chodzenia.
     *
     * @param {Object} mesh
     * @param {boolean} isMoving
     * @private
     */
    _animatePaws(mesh, isMoving) {
        if (!isMoving) return;

        let pawIndex = 0;
        mesh.children.forEach((child) => {
            if (child.geometry?.type === 'CylinderGeometry' && child.position.y < 0.15 && child.position.y > 0.05) {
                const offset = pawIndex % 2 === 0 ? 0 : Math.PI;
                child.rotation.x = Math.sin(this._time * 10 + offset) * 0.3;
                pawIndex++;
            }
        });
    }

    /**
     * Animacja ciała — lekkie kołysanie podczas ruchu.
     *
     * @param {Object} mesh
     * @param {boolean} isMoving
     * @private
     */
    _animateBody(mesh, isMoving) {
        if (isMoving) {
            mesh.rotation.z = Math.sin(this._time * 6) * 0.02;
        } else {
            // Oddychanie
            mesh.rotation.z = Math.sin(this._time * 1.5) * 0.005;
        }
    }
}

export default AnimationSystem;
