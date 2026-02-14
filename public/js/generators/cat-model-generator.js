/**
 * CatModelGenerator — realistyczny proceduralny model kota z Three.js geometrii.
 *
 * Generuje model kota z zaokrąglonymi kształtami na podstawie CatConfig.
 * Wzory futra: solid, striped, spotted, speckled, patched, bicolor.
 * Cache'uje materiały — nigdy nie tworzy nowych per obiekt.
 */

/** @type {Array<string>} Dostępne wzory futra */
export const FUR_PATTERNS = ['solid', 'striped', 'spotted', 'speckled', 'patched', 'bicolor'];

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
     * Utwórz realistyczny model kota.
     *
     * @param {Object} config - { furColor, pattern, eyeColor, age, gender }
     * @returns {Object} Three.js Group
     */
    create(config = {}) {
        const THREE = this._THREE;
        const group = new THREE.Group();

        const furColor = config.furColor || config.fur_color || '#ff8800';
        const eyeColor = config.eyeColor || config.eye_color || '#00cc44';
        const pattern = config.pattern || 'solid';

        const furMat = this._getMaterial(furColor);
        const eyeMat = this._getMaterial(eyeColor);
        const noseMat = this._getMaterial('#e8768a');
        const darkMat = this._getMaterial('#111111');
        const whiteMat = this._getMaterial('#f5f0e8');
        const innerEarMat = this._getMaterial(this._lightenColor(furColor, 1.3));
        const pawPadMat = this._getMaterial('#d4a0a0');

        // Skala wg wieku
        const ageScale = config.age === 'young' ? 0.7 : config.age === 'senior' ? 1.05 : 1.0;

        // ── CIAŁO (owalne, zaokrąglone) ──
        const bodyGeo = new THREE.SphereGeometry(1, 12, 10);
        bodyGeo.scale(0.32, 0.28, 0.52);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.set(0, 0.38, 0);
        group.add(body);

        // Klatka piersiowa (lekko szersza z przodu)
        const chestGeo = new THREE.SphereGeometry(1, 10, 8);
        chestGeo.scale(0.30, 0.27, 0.22);
        const chest = new THREE.Mesh(chestGeo, furMat);
        chest.position.set(0, 0.40, 0.28);
        group.add(chest);

        // Biodra (lekko szersze z tyłu)
        const hipGeo = new THREE.SphereGeometry(1, 10, 8);
        hipGeo.scale(0.28, 0.26, 0.20);
        const hip = new THREE.Mesh(hipGeo, furMat);
        hip.position.set(0, 0.36, -0.30);
        group.add(hip);

        // ── GŁOWA (zaokrąglona, lekko spłaszczona) ──
        const headGeo = new THREE.SphereGeometry(0.22, 12, 10);
        headGeo.scale(1.0, 0.92, 0.88);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 0.62, 0.48);
        group.add(head);

        // Pysk (wypukłość)
        const muzzleGeo = new THREE.SphereGeometry(0.10, 8, 8);
        muzzleGeo.scale(0.8, 0.6, 0.7);
        const muzzle = new THREE.Mesh(muzzleGeo, furMat);
        muzzle.position.set(0, 0.56, 0.66);
        group.add(muzzle);

        // Podbródek (biały u dołu pyska)
        const chinGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const chin = new THREE.Mesh(chinGeo, whiteMat);
        chin.position.set(0, 0.52, 0.65);
        group.add(chin);

        // ── USZY (trójkątne, z wnętrzem) ──
        const earGeo = new THREE.ConeGeometry(0.065, 0.16, 4);
        const innerEarGeo = new THREE.ConeGeometry(0.04, 0.12, 4);

        const earL = new THREE.Mesh(earGeo, furMat);
        earL.position.set(-0.13, 0.84, 0.48);
        earL.rotation.set(-0.15, 0, -0.15);
        group.add(earL);

        const earLInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        earLInner.position.set(-0.13, 0.84, 0.50);
        earLInner.rotation.set(-0.15, 0, -0.15);
        group.add(earLInner);

        const earR = new THREE.Mesh(earGeo, furMat);
        earR.position.set(0.13, 0.84, 0.48);
        earR.rotation.set(-0.15, 0, 0.15);
        group.add(earR);

        const earRInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        earRInner.position.set(0.13, 0.84, 0.50);
        earRInner.rotation.set(-0.15, 0, 0.15);
        group.add(earRInner);

        // ── OCZY (realistyczne: białko + tęczówka + źrenica) ──
        const eyeWhiteGeo = new THREE.SphereGeometry(0.048, 10, 8);
        eyeWhiteGeo.scale(1.0, 0.85, 0.6);
        const irisGeo = new THREE.SphereGeometry(0.032, 8, 8);
        const pupilGeo = new THREE.SphereGeometry(0.016, 6, 6);
        pupilGeo.scale(1.0, 1.8, 1.0);

        // Lewe oko
        const eyeWhiteL = new THREE.Mesh(eyeWhiteGeo, whiteMat);
        eyeWhiteL.position.set(-0.09, 0.65, 0.65);
        group.add(eyeWhiteL);

        const irisL = new THREE.Mesh(irisGeo, eyeMat);
        irisL.position.set(-0.09, 0.65, 0.69);
        group.add(irisL);

        const pupilL = new THREE.Mesh(pupilGeo, darkMat);
        pupilL.position.set(-0.09, 0.65, 0.71);
        group.add(pupilL);

        // Prawe oko
        const eyeWhiteR = new THREE.Mesh(eyeWhiteGeo, whiteMat);
        eyeWhiteR.position.set(0.09, 0.65, 0.65);
        group.add(eyeWhiteR);

        const irisR = new THREE.Mesh(irisGeo, eyeMat);
        irisR.position.set(0.09, 0.65, 0.69);
        group.add(irisR);

        const pupilR = new THREE.Mesh(pupilGeo, darkMat);
        pupilR.position.set(0.09, 0.65, 0.71);
        group.add(pupilR);

        // ── NOS ──
        const noseGeo = new THREE.SphereGeometry(0.025, 6, 6);
        noseGeo.scale(1.2, 0.8, 0.8);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 0.585, 0.72);
        group.add(nose);

        // ── WĄSY (cienkie cylindry) ──
        const whiskerMat = this._getMaterial('#cccccc');
        const whiskerGeo = new THREE.CylinderGeometry(0.003, 0.002, 0.18, 3);
        const whiskerPositions = [
            { x: -0.06, y: 0.565, z: 0.70, rz: 0.1, ry: 0.3 },
            { x: -0.06, y: 0.555, z: 0.70, rz: 0.0, ry: 0.3 },
            { x: -0.06, y: 0.545, z: 0.70, rz: -0.1, ry: 0.3 },
            { x: 0.06, y: 0.565, z: 0.70, rz: 0.1, ry: -0.3 },
            { x: 0.06, y: 0.555, z: 0.70, rz: 0.0, ry: -0.3 },
            { x: 0.06, y: 0.545, z: 0.70, rz: -0.1, ry: -0.3 },
        ];
        for (const w of whiskerPositions) {
            const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
            whisker.position.set(w.x, w.y, w.z);
            whisker.rotation.set(0, w.ry, Math.PI / 2 + w.rz);
            group.add(whisker);
        }

        // ── ŁAPY (zaokrąglone, z poduszkami) ──
        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.28, 8);
        const pawGeo = new THREE.SphereGeometry(0.065, 8, 6);
        pawGeo.scale(1.0, 0.5, 1.1);

        const legPositions = [
            { x: -0.18, z: 0.22, front: true },
            { x: 0.18, z: 0.22, front: true },
            { x: -0.18, z: -0.25, front: false },
            { x: 0.18, z: -0.25, front: false },
        ];

        for (const lp of legPositions) {
            const legH = lp.front ? 0.28 : 0.26;
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.055, legH, 8),
                furMat
            );
            leg.position.set(lp.x, legH / 2, lp.z);
            group.add(leg);

            // Łapka (poduszka)
            const paw = new THREE.Mesh(pawGeo, furMat);
            paw.position.set(lp.x, 0.02, lp.z + (lp.front ? 0.02 : -0.02));
            group.add(paw);

            // Poduszka łapy (spód)
            const padGeo = new THREE.SphereGeometry(0.04, 6, 4);
            padGeo.scale(1.0, 0.3, 1.0);
            const pad = new THREE.Mesh(padGeo, pawPadMat);
            pad.position.set(lp.x, 0.005, lp.z);
            group.add(pad);
        }

        // ── OGON (zakrzywiony z segmentów) ──
        this._buildTail(group, furMat);

        // ── WZORY FUTRA ──
        this._applyPattern(group, pattern, furColor, furMat);

        group.scale.set(ageScale, ageScale, ageScale);
        group.userData = { type: 'cat' };

        return group;
    }

    /**
     * Zbuduj zakrzywiony ogon z segmentów.
     *
     * @param {Object} group
     * @param {Object} furMat
     * @private
     */
    _buildTail(group, furMat) {
        const THREE = this._THREE;
        const segments = 6;
        const segLen = 0.10;
        let x = 0, y = 0.42, z = -0.50;
        let angle = -0.6;

        for (let i = 0; i < segments; i++) {
            const radius = 0.04 - i * 0.004;
            const geo = new THREE.SphereGeometry(Math.max(radius, 0.015), 6, 6);
            geo.scale(1.0, 1.0, 1.8);
            const seg = new THREE.Mesh(geo, furMat);
            seg.position.set(x, y, z);
            seg.userData = { tailSegment: i };
            group.add(seg);

            // Zakrzywienie ogona do góry
            angle += 0.18;
            z -= Math.cos(angle) * segLen;
            y += Math.sin(angle) * segLen;
        }
    }

    /**
     * Zastosuj wzór futra na modelu.
     *
     * @param {Object} group
     * @param {string} pattern
     * @param {string} furColor
     * @param {Object} furMat
     * @private
     */
    _applyPattern(group, pattern, furColor, furMat) {
        const THREE = this._THREE;

        switch (pattern) {
            case 'striped':
                this._addStripes(group, furColor);
                break;
            case 'spotted':
                this._addSpots(group, furColor, 0.055, 8);
                break;
            case 'speckled':
                this._addSpots(group, furColor, 0.025, 18);
                break;
            case 'patched':
                this._addPatches(group, furColor);
                break;
            case 'bicolor':
                this._addBicolor(group, furColor);
                break;
            case 'solid':
            default:
                break;
        }
    }

    /**
     * Wzór: pręgi (tabby) — ciemniejsze paski na grzbiecie i bokach.
     *
     * @param {Object} group
     * @param {string} furColor
     * @private
     */
    _addStripes(group, furColor) {
        const THREE = this._THREE;
        const stripeMat = this._getMaterial(this._darkenColor(furColor, 0.55));

        // Pręgi na grzbiecie
        for (let i = 0; i < 5; i++) {
            const geo = new THREE.BoxGeometry(0.34, 0.025, 0.04);
            const stripe = new THREE.Mesh(geo, stripeMat);
            stripe.position.set(0, 0.53, 0.20 - i * 0.12);
            group.add(stripe);
        }

        // Pręgi na bokach (lewy)
        for (let i = 0; i < 4; i++) {
            const geo = new THREE.BoxGeometry(0.025, 0.14, 0.04);
            const stripe = new THREE.Mesh(geo, stripeMat);
            stripe.position.set(-0.30, 0.38, 0.15 - i * 0.12);
            stripe.rotation.z = 0.2;
            group.add(stripe);
        }

        // Pręgi na bokach (prawy)
        for (let i = 0; i < 4; i++) {
            const geo = new THREE.BoxGeometry(0.025, 0.14, 0.04);
            const stripe = new THREE.Mesh(geo, stripeMat);
            stripe.position.set(0.30, 0.38, 0.15 - i * 0.12);
            stripe.rotation.z = -0.2;
            group.add(stripe);
        }

        // Prążki na głowie (M-kształt tabby)
        const headStripeGeo = new THREE.BoxGeometry(0.10, 0.015, 0.02);
        const hsL = new THREE.Mesh(headStripeGeo, stripeMat);
        hsL.position.set(-0.06, 0.74, 0.55);
        hsL.rotation.z = 0.4;
        group.add(hsL);

        const hsR = new THREE.Mesh(headStripeGeo, stripeMat);
        hsR.position.set(0.06, 0.74, 0.55);
        hsR.rotation.z = -0.4;
        group.add(hsR);
    }

    /**
     * Wzór: centkowany / nakrapiany — ciemne kropki.
     *
     * @param {Object} group
     * @param {string} furColor
     * @param {number} spotSize
     * @param {number} count
     * @private
     */
    _addSpots(group, furColor, spotSize, count) {
        const THREE = this._THREE;
        const spotMat = this._getMaterial(this._darkenColor(furColor, 0.45));
        const spotGeo = new THREE.SphereGeometry(spotSize, 6, 6);

        // Deterministyczne pozycje
        let seed = 42;
        const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

        for (let i = 0; i < count; i++) {
            const sx = (rng() - 0.5) * 0.56;
            const sy = 0.28 + rng() * 0.26;
            const sz = (rng() - 0.5) * 0.90;

            const spot = new THREE.Mesh(spotGeo, spotMat);
            spot.position.set(sx, sy, sz);
            group.add(spot);
        }
    }

    /**
     * Wzór: łaciaty — duże plamy innego koloru.
     *
     * @param {Object} group
     * @param {string} furColor
     * @private
     */
    _addPatches(group, furColor) {
        const THREE = this._THREE;
        const patchMat = this._getMaterial(this._darkenColor(furColor, 0.4));
        const whitePatchMat = this._getMaterial('#f0e6d3');

        // Duże plamy ciemne
        const patches = [
            { x: -0.15, y: 0.42, z: 0.10, r: 0.12 },
            { x: 0.10, y: 0.38, z: -0.15, r: 0.10 },
            { x: 0.20, y: 0.45, z: 0.20, r: 0.08 },
        ];
        for (const p of patches) {
            const geo = new THREE.SphereGeometry(p.r, 8, 6);
            geo.scale(1.2, 0.8, 1.4);
            const patch = new THREE.Mesh(geo, patchMat);
            patch.position.set(p.x, p.y, p.z);
            group.add(patch);
        }

        // Białe plamy
        const whitePatches = [
            { x: 0.0, y: 0.35, z: 0.30, r: 0.10 },
            { x: -0.12, y: 0.40, z: -0.25, r: 0.08 },
        ];
        for (const p of whitePatches) {
            const geo = new THREE.SphereGeometry(p.r, 8, 6);
            geo.scale(1.3, 0.7, 1.2);
            const patch = new THREE.Mesh(geo, whitePatchMat);
            patch.position.set(p.x, p.y, p.z);
            group.add(patch);
        }
    }

    /**
     * Wzór: dwukolorowy — biały brzuch i łapy, kolorowy grzbiet.
     *
     * @param {Object} group
     * @param {string} furColor
     * @private
     */
    _addBicolor(group, furColor) {
        const THREE = this._THREE;
        const whiteMat = this._getMaterial('#f5f0e8');

        // Biały brzuch
        const bellyGeo = new THREE.SphereGeometry(1, 10, 8);
        bellyGeo.scale(0.26, 0.18, 0.44);
        const belly = new THREE.Mesh(bellyGeo, whiteMat);
        belly.position.set(0, 0.22, 0.0);
        group.add(belly);

        // Biała klatka piersiowa
        const chestWhiteGeo = new THREE.SphereGeometry(0.14, 8, 6);
        chestWhiteGeo.scale(1.0, 0.8, 0.8);
        const chestWhite = new THREE.Mesh(chestWhiteGeo, whiteMat);
        chestWhite.position.set(0, 0.34, 0.38);
        group.add(chestWhite);

        // Biała plama na pysku
        const facePatchGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const facePatch = new THREE.Mesh(facePatchGeo, whiteMat);
        facePatch.position.set(0, 0.58, 0.68);
        group.add(facePatch);
    }

    /**
     * Pobierz lub utwórz materiał (cache).
     *
     * @param {string} color
     * @returns {Object}
     * @private
     */
    _getMaterial(color) {
        const key = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;
        if (this._materialCache.has(key)) {
            return this._materialCache.get(key);
        }
        const mat = new this._THREE.MeshStandardMaterial({
            color: key,
            roughness: 0.85,
            metalness: 0.0,
        });
        this._materialCache.set(key, mat);
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

    /**
     * Rozjaśnij kolor hex.
     *
     * @param {string} hex
     * @param {number} factor - >1 rozjaśnia
     * @returns {string}
     * @private
     */
    _lightenColor(hex, factor) {
        const c = new this._THREE.Color(hex);
        c.r = Math.min(1, c.r * factor);
        c.g = Math.min(1, c.g * factor);
        c.b = Math.min(1, c.b * factor);
        return '#' + c.getHexString();
    }
}

export default CatModelGenerator;
