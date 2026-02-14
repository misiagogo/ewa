/**
 * CameraSystem — system ECS sterujący kamerą third-person.
 *
 * Śledzi encję z komponentami Transform + CameraTarget.
 * Smooth follow z lerp. Kamera za kotem z offsetem.
 */

import Transform from '../components/transform.js';
import CameraTarget from '../components/camera-target.js';
import { lerp } from '../utils/math-utils.js';

class CameraSystem {
    /** @type {Object|null} Three.js Camera */
    _camera = null;

    /** @type {{x: number, y: number, z: number}} Aktualna pozycja kamery */
    _currentPos = { x: 0, y: 5, z: -10 };

    /**
     * @param {Object} camera - Three.js PerspectiveCamera
     */
    constructor(camera) {
        this._camera = camera;
    }

    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        if (!this._camera) return;

        const entities = world.query([Transform, CameraTarget]);

        for (const entityId of entities) {
            const transform = world.getComponent(entityId, Transform);
            const camTarget = world.getComponent(entityId, CameraTarget);

            // Docelowa pozycja kamery: za encją wg rotacji
            const targetX = transform.x - Math.sin(transform.rotationY) * camTarget.distance;
            const targetY = transform.y + camTarget.height;
            const targetZ = transform.z - Math.cos(transform.rotationY) * camTarget.distance;

            // Smooth follow
            this._currentPos.x = lerp(this._currentPos.x, targetX, camTarget.smoothSpeed);
            this._currentPos.y = lerp(this._currentPos.y, targetY, camTarget.smoothSpeed);
            this._currentPos.z = lerp(this._currentPos.z, targetZ, camTarget.smoothSpeed);

            this._camera.position.set(
                this._currentPos.x,
                this._currentPos.y,
                this._currentPos.z
            );

            // Patrz na encję (lekko powyżej)
            this._camera.lookAt(transform.x, transform.y + 1, transform.z);

            // Tylko pierwszy target
            break;
        }
    }
}

export default CameraSystem;
