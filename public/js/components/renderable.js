/**
 * Renderable — komponent przechowujący referencję do Three.js mesh.
 *
 * Wyjątek od reguły "zero Three.js w komponentach" — przechowuje referencję.
 */

class Renderable {
    /** @type {Object|null} Three.js Object3D / Mesh / Group */
    mesh;

    /**
     * @param {Object|null} [mesh=null] - Three.js mesh
     */
    constructor(mesh = null) {
        this.mesh = mesh;
    }
}

export default Renderable;
