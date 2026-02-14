/**
 * CatModelGenerator — proceduralny model kota z Three.js geometrii.
 *
 * Generuje model kota (ciało, głowa, uszy, ogon, łapy) na podstawie CatConfig.
 * Cache'uje materiały — nigdy nie tworzy nowych per obiekt.
 */

class CatModelGenerator {
    /** @type {Object} Three.js module */
    _THREE;

    /** @type {Map<string, Object>} Cache materiałów */
    _materialCache = new Map();

    /**
     * @param {Object} THREE - Three.js module
     */
    constructor(THREE) {
        this._THREE = THREE;
    }

    /**
     * Utwórz model kota.
     *
     * @param {Object} config - { furColor, pattern, eyeColor, age, gender }
     * @returns {Object} Three.js Group
     */
    create(config = {}) {
        const THREE = this._THREE;
        const group = new THREE.Group();

        const furColor = config.furColor || config.fur_color || '#ff8800';
        const eyeColor = config.eyeColor || config.eye_color || '#00cc44';
        const furMat = this._getMaterial(furColor);
        const eyeMat = this._getMaterial(eyeColor);
        const noseMat = this._getMaterial('#ff6699');
        const darkMat = this._getMaterial('#222222');

        // Skala wg wieku
        const ageScale = config.age === 'young' ? 0.7 : config.age === 'senior' ? 1.1 : 1.0;

        // Ciało
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.5, 1.0);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.set(0, 0.35, 0);
        group.add(body);

        // Głowa
        const headGeo = new THREE.BoxGeometry(0.5, 0.45, 0.45);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 0.65, 0.55);
        group.add(head);

        // Uszy
        const earGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
        const earL = new THREE.Mesh(earGeo, furMat);
        earL.position.set(-0.15, 0.92, 0.55);
        group.add(earL);

        const earR = new THREE.Mesh(earGeo, furMat);
        earR.position.set(0.15, 0.92, 0.55);
        group.add(earR);

        // Oczy
        const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.12, 0.7, 0.78);
        group.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.12, 0.7, 0.78);
        group.add(eyeR);

        // Źrenice
        const pupilGeo = new THREE.SphereGeometry(0.025, 4, 4);
        const pupilL = new THREE.Mesh(pupilGeo, darkMat);
        pupilL.position.set(-0.12, 0.7, 0.83);
        group.add(pupilL);

        const pupilR = new THREE.Mesh(pupilGeo, darkMat);
        pupilR.position.set(0.12, 0.7, 0.83);
        group.add(pupilR);

        // Nos
        const noseGeo = new THREE.SphereGeometry(0.03, 4, 4);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 0.62, 0.8);
        group.add(nose);

        // Łapy (4)
        const pawGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 6);
        const pawPositions = [
            [-0.2, 0.1, 0.3],
            [0.2, 0.1, 0.3],
            [-0.2, 0.1, -0.3],
            [0.2, 0.1, -0.3],
        ];
        for (const [px, py, pz] of pawPositions) {
            const paw = new THREE.Mesh(pawGeo, furMat);
            paw.position.set(px, py, pz);
            group.add(paw);
        }

        // Ogon
        const tailGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.6, 6);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.position.set(0, 0.5, -0.6);
        tail.rotation.x = -0.5;
        group.add(tail);

        // Wzór (pręgi)
        if (config.pattern === 'striped') {
            const stripeMat = this._getMaterial(this._darkenColor(furColor, 0.6));
            for (let i = 0; i < 3; i++) {
                const stripeGeo = new THREE.BoxGeometry(0.62, 0.04, 0.08);
                const stripe = new THREE.Mesh(stripeGeo, stripeMat);
                stripe.position.set(0, 0.45 + i * 0.08, -0.1 + i * 0.15);
                group.add(stripe);
            }
        } else if (config.pattern === 'spotted') {
            const spotMat = this._getMaterial(this._darkenColor(furColor, 0.5));
            const spotGeo = new THREE.SphereGeometry(0.06, 4, 4);
            const spots = [[0.15, 0.4, 0.1], [-0.1, 0.45, -0.2], [0.2, 0.35, -0.1]];
            for (const [sx, sy, sz] of spots) {
                const spot = new THREE.Mesh(spotGeo, spotMat);
                spot.position.set(sx, sy, sz);
                group.add(spot);
            }
        }

        group.scale.set(ageScale, ageScale, ageScale);
        group.userData = { type: 'cat' };

        return group;
    }

    /**
     * Pobierz lub utwórz materiał (cache).
     *
     * @param {string} color
     * @returns {Object}
     * @private
     */
    _getMaterial(color) {
        if (this._materialCache.has(color)) {
            return this._materialCache.get(color);
        }
        const mat = new this._THREE.MeshLambertMaterial({ color });
        this._materialCache.set(color, mat);
        return mat;
    }

    /**
     * Przyciemnij kolor hex.
     *
     * @param {string} hex
     * @param {number} factor - 0-1 (0=czarny, 1=oryginalny)
     * @returns {string}
     * @private
     */
    _darkenColor(hex, factor) {
        const c = new this._THREE.Color(hex);
        c.multiplyScalar(factor);
        return '#' + c.getHexString();
    }
}

export default CatModelGenerator;
