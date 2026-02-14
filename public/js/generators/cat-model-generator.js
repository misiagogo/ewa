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
     * Utwórz fotorealistyczny model kota.
     *
     * Płeć, wiek i waga wpływają na proporcje:
     * - Kocur: masywniejszy, szersza głowa, grubszy kark, większy pysk
     * - Kotka: smuklejsza, delikatniejsza, mniejsza głowa
     * - Młody: duża głowa/oczy, krótkie ciało, cienkie łapki, duże uszy
     * - Dorosły: normalne proporcje
     * - Senior: chudszy, dłuższy pysk, lekko obwisłe uszy, widoczne kości
     *
     * @param {Object} config - { furColor, pattern, eyeColor, age, gender, weight }
     * @returns {Object} Three.js Group
     */
    create(config = {}) {
        const THREE = this._THREE;
        const group = new THREE.Group();

        const furColor = config.furColor || config.fur_color || '#ff8800';
        const eyeColor = config.eyeColor || config.eye_color || '#00cc44';
        const pattern = config.pattern || 'solid';
        const weight = parseFloat(config.weight) || 4.5;
        const gender = config.gender || 'male';
        const age = config.age || 'adult';

        const furMat = this._getMaterial(furColor);
        const eyeMat = this._getMaterial(eyeColor);
        const noseMat = this._getMaterial('#e8768a');
        const darkMat = this._getMaterial('#111111');
        const whiteMat = this._getMaterial('#f5f0e8');
        const innerEarMat = this._getMaterial(this._lightenColor(furColor, 1.3));
        const pawPadMat = this._getMaterial('#d4a0a0');
        const gumMat = this._getMaterial('#c4737b');

        // ── MNOŻNIKI PŁCI ──
        // Kocur: masywniejszy (+15% szerokość, +10% głowa, grubszy kark)
        // Kotka: smuklejsza (-10% szerokość, -5% głowa, delikatniejsza)
        const gW = gender === 'male' ? 1.12 : 0.90;   // szerokość ciała
        const gH = gender === 'male' ? 1.05 : 0.97;   // wysokość ciała
        const gHead = gender === 'male' ? 1.10 : 0.92; // rozmiar głowy
        const gMuzzle = gender === 'male' ? 1.15 : 0.85; // rozmiar pyska
        const gNeck = gender === 'male' ? 1.25 : 0.85; // grubość szyi/karku
        const gEar = gender === 'male' ? 1.0 : 1.08;   // rozmiar uszu (kotki mają proporcjonalnie większe)
        const gWhisker = gender === 'male' ? 1.1 : 0.9; // długość wąsów
        const gOverall = gender === 'male' ? 1.05 : 0.95; // ogólna skala

        // ── MNOŻNIKI WIEKU ──
        // Młody: duża głowa/oczy, krótkie ciało, cienkie łapki
        // Senior: chudszy, dłuższy pysk, kościsty
        const aBody = age === 'young' ? 0.75 : age === 'senior' ? 0.92 : 1.0;
        const aHead = age === 'young' ? 1.25 : age === 'senior' ? 0.95 : 1.0;
        const aEye = age === 'young' ? 1.35 : age === 'senior' ? 0.90 : 1.0;
        const aEar = age === 'young' ? 1.20 : age === 'senior' ? 1.05 : 1.0;
        const aMuzzle = age === 'young' ? 0.75 : age === 'senior' ? 1.15 : 1.0;
        const aLeg = age === 'young' ? 0.80 : age === 'senior' ? 0.90 : 1.0;
        const aScale = age === 'young' ? 0.68 : age === 'senior' ? 1.02 : 1.0;
        const aThin = age === 'senior' ? 0.85 : 1.0; // senior jest chudszy

        // ── MNOŻNIKI WAGI ──
        const wNorm = (weight - 2) / 10;
        const wFat = 0.85 + wNorm * 0.5;
        const wLen = 0.95 + wNorm * 0.12;
        const wLeg = 1.0 - wNorm * 0.15;
        const wBelly = Math.max(0, wNorm - 0.5) * 0.4;

        // ── CIAŁO (owalne, zaokrąglone) ──
        const bodyGeo = new THREE.SphereGeometry(1, 16, 12);
        bodyGeo.scale(0.32 * wFat * gW * aThin, 0.28 * wFat * gH, 0.52 * wLen * aBody);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.set(0, 0.38, 0);
        group.add(body);

        // Klatka piersiowa
        const chestGeo = new THREE.SphereGeometry(1, 12, 10);
        chestGeo.scale(0.30 * wFat * gW * aThin, 0.27 * wFat * gH, 0.22 * wLen * aBody);
        const chest = new THREE.Mesh(chestGeo, furMat);
        chest.position.set(0, 0.40, 0.28 * aBody);
        group.add(chest);

        // Biodra
        const hipGeo = new THREE.SphereGeometry(1, 12, 10);
        hipGeo.scale(0.28 * wFat * gW * aThin, 0.26 * wFat * gH, 0.20 * wLen * aBody);
        const hip = new THREE.Mesh(hipGeo, furMat);
        hip.position.set(0, 0.36, -0.30 * aBody);
        group.add(hip);

        // Łopatki (widoczne u chudych/seniorów)
        if (age === 'senior' || weight < 4) {
            const shoulderGeo = new THREE.SphereGeometry(0.06, 6, 6);
            shoulderGeo.scale(1.0, 0.6, 0.8);
            const shoulderL = new THREE.Mesh(shoulderGeo, furMat);
            shoulderL.position.set(-0.18, 0.50, 0.15);
            group.add(shoulderL);
            const shoulderR = new THREE.Mesh(shoulderGeo, furMat);
            shoulderR.position.set(0.18, 0.50, 0.15);
            group.add(shoulderR);
        }

        // Brzuszek (widoczny u grubszych kotów)
        if (wBelly > 0.01) {
            const bellyGeo = new THREE.SphereGeometry(1, 10, 8);
            bellyGeo.scale(0.24 * wFat * gW, 0.12 + wBelly, 0.36 * wLen * aBody);
            const belly = new THREE.Mesh(bellyGeo, furMat);
            belly.position.set(0, 0.22, -0.02);
            group.add(belly);
        }

        // ── SZYJA / KARK ──
        const neckGeo = new THREE.SphereGeometry(1, 10, 8);
        neckGeo.scale(0.16 * gNeck * wFat, 0.14 * gH, 0.14);
        const neck = new THREE.Mesh(neckGeo, furMat);
        neck.position.set(0, 0.50, 0.36 * aBody);
        group.add(neck);

        // Kark (grubszy u kocurów — widoczny mięsień)
        if (gender === 'male') {
            const scruffGeo = new THREE.SphereGeometry(0.10, 8, 6);
            scruffGeo.scale(1.2 * wFat, 0.8, 0.9);
            const scruff = new THREE.Mesh(scruffGeo, furMat);
            scruff.position.set(0, 0.54, 0.30 * aBody);
            group.add(scruff);
        }

        // ── GŁOWA ──
        const headR = 0.22 * gHead * aHead;
        const headGeo = new THREE.SphereGeometry(headR, 16, 12);
        headGeo.scale(1.0 * (0.95 + wNorm * 0.12), 0.92, 0.90);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 0.62, 0.48 * aBody);
        group.add(head);

        // Policzki (kocury mają szersze)
        const cheekR = 0.08 * gHead * aHead;
        const cheekGeo = new THREE.SphereGeometry(cheekR, 8, 6);
        cheekGeo.scale(1.0, 0.75, 0.8);
        const cheekL = new THREE.Mesh(cheekGeo, furMat);
        cheekL.position.set(-0.14 * gHead, 0.58, 0.55 * aBody);
        group.add(cheekL);
        const cheekR2 = new THREE.Mesh(cheekGeo, furMat);
        cheekR2.position.set(0.14 * gHead, 0.58, 0.55 * aBody);
        group.add(cheekR2);

        // Pysk (kocur: szerszy/masywniejszy, kotka: delikatniejszy, senior: dłuższy)
        const muzzleGeo = new THREE.SphereGeometry(0.10 * gMuzzle * aMuzzle, 10, 8);
        muzzleGeo.scale(0.8, 0.6, 0.7 * aMuzzle);
        const muzzle = new THREE.Mesh(muzzleGeo, furMat);
        muzzle.position.set(0, 0.56, (0.66 + (aMuzzle - 1) * 0.04) * aBody);
        group.add(muzzle);

        // Podbródek
        const chinGeo = new THREE.SphereGeometry(0.05 * gMuzzle, 6, 6);
        const chin = new THREE.Mesh(chinGeo, whiteMat);
        chin.position.set(0, 0.52, 0.65 * aBody);
        group.add(chin);

        // Brwi (lekkie wypukłości nad oczami)
        const browGeo = new THREE.SphereGeometry(0.035, 6, 4);
        browGeo.scale(1.5, 0.5, 0.8);
        const browL = new THREE.Mesh(browGeo, furMat);
        browL.position.set(-0.08 * gHead, 0.70 * aHead, 0.60 * aBody);
        group.add(browL);
        const browR = new THREE.Mesh(browGeo, furMat);
        browR.position.set(0.08 * gHead, 0.70 * aHead, 0.60 * aBody);
        group.add(browR);

        // ── USZY (rozmiar zależy od płci i wieku) ──
        const earH = 0.16 * gEar * aEar;
        const earR2 = 0.065 * gEar * aEar;
        const earGeo = new THREE.ConeGeometry(earR2, earH, 4);
        const innerEarH = earH * 0.75;
        const innerEarR = earR2 * 0.6;
        const innerEarGeo = new THREE.ConeGeometry(innerEarR, innerEarH, 4);

        // Pozycja uszu (młode: wyżej i bardziej na boki, senior: lekko obwisłe)
        const earY = age === 'young' ? 0.88 : age === 'senior' ? 0.80 : 0.84;
        const earSpread = age === 'young' ? 0.15 : 0.13;
        const earDroop = age === 'senior' ? -0.25 : -0.15; // senior: bardziej obwisłe

        const earL = new THREE.Mesh(earGeo, furMat);
        earL.position.set(-earSpread * gHead, earY * aHead, 0.48 * aBody);
        earL.rotation.set(earDroop, 0, -0.15);
        group.add(earL);

        const earLInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        earLInner.position.set(-earSpread * gHead, earY * aHead, (0.48 + 0.02) * aBody);
        earLInner.rotation.set(earDroop, 0, -0.15);
        group.add(earLInner);

        const earRMesh = new THREE.Mesh(earGeo, furMat);
        earRMesh.position.set(earSpread * gHead, earY * aHead, 0.48 * aBody);
        earRMesh.rotation.set(earDroop, 0, 0.15);
        group.add(earRMesh);

        const earRInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        earRInner.position.set(earSpread * gHead, earY * aHead, (0.48 + 0.02) * aBody);
        earRInner.rotation.set(earDroop, 0, 0.15);
        group.add(earRInner);

        // ── OCZY (rozmiar zależy od wieku — młode mają duże oczy) ──
        const eyeS = aEye;
        const eyeWhiteGeo = new THREE.SphereGeometry(0.048 * eyeS, 12, 10);
        eyeWhiteGeo.scale(1.0, 0.85, 0.6);
        const irisGeo = new THREE.SphereGeometry(0.032 * eyeS, 10, 8);
        const pupilGeo = new THREE.SphereGeometry(0.016 * eyeS, 8, 6);
        pupilGeo.scale(1.0, 1.8, 1.0);

        const eyeSpread = 0.09 * gHead * aHead;
        const eyeY = 0.65 * aHead;
        const eyeZ = 0.65 * aBody;

        const eyeWhiteL = new THREE.Mesh(eyeWhiteGeo, whiteMat);
        eyeWhiteL.position.set(-eyeSpread, eyeY, eyeZ);
        group.add(eyeWhiteL);
        const irisL = new THREE.Mesh(irisGeo, eyeMat);
        irisL.position.set(-eyeSpread, eyeY, eyeZ + 0.04);
        group.add(irisL);
        const pupilL = new THREE.Mesh(pupilGeo, darkMat);
        pupilL.position.set(-eyeSpread, eyeY, eyeZ + 0.06);
        group.add(pupilL);

        const eyeWhiteR = new THREE.Mesh(eyeWhiteGeo, whiteMat);
        eyeWhiteR.position.set(eyeSpread, eyeY, eyeZ);
        group.add(eyeWhiteR);
        const irisR = new THREE.Mesh(irisGeo, eyeMat);
        irisR.position.set(eyeSpread, eyeY, eyeZ + 0.04);
        group.add(irisR);
        const pupilR = new THREE.Mesh(pupilGeo, darkMat);
        pupilR.position.set(eyeSpread, eyeY, eyeZ + 0.06);
        group.add(pupilR);

        // ── NOS (rozmiar zależy od pyska) ──
        const noseGeo = new THREE.SphereGeometry(0.025 * gMuzzle * aMuzzle, 8, 6);
        noseGeo.scale(1.2, 0.8, 0.8);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 0.585, (0.72 + (aMuzzle - 1) * 0.03) * aBody);
        group.add(nose);

        // Usta (linia pod nosem)
        const mouthGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.03, 3);
        const mouth = new THREE.Mesh(mouthGeo, gumMat);
        mouth.position.set(0, 0.565, (0.73 + (aMuzzle - 1) * 0.03) * aBody);
        group.add(mouth);

        // ── WĄSY (długość zależy od płci) ──
        const whiskerMat = this._getMaterial('#cccccc');
        const whiskerLen = 0.18 * gWhisker;
        const whiskerGeo = new THREE.CylinderGeometry(0.003, 0.002, whiskerLen, 3);
        const wZ = (0.70 + (aMuzzle - 1) * 0.02) * aBody;
        const whiskerPositions = [
            { x: -0.06, y: 0.565, z: wZ, rz: 0.1, ry: 0.3 },
            { x: -0.06, y: 0.555, z: wZ, rz: 0.0, ry: 0.3 },
            { x: -0.06, y: 0.545, z: wZ, rz: -0.1, ry: 0.3 },
            { x: 0.06, y: 0.565, z: wZ, rz: 0.1, ry: -0.3 },
            { x: 0.06, y: 0.555, z: wZ, rz: 0.0, ry: -0.3 },
            { x: 0.06, y: 0.545, z: wZ, rz: -0.1, ry: -0.3 },
        ];
        for (const w of whiskerPositions) {
            const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
            whisker.position.set(w.x, w.y, w.z);
            whisker.rotation.set(0, w.ry, Math.PI / 2 + w.rz);
            group.add(whisker);
        }

        // ── ŁAPY (grubość zależy od wagi, długość od wieku) ──
        const legThick = 0.05 * wFat * gW * aLeg;
        const pawSize = 0.065 * wFat * aLeg;

        const legPositions = [
            { x: -0.18 * wFat * gW, z: 0.22 * aBody, front: true, name: 'legFL' },
            { x: 0.18 * wFat * gW, z: 0.22 * aBody, front: true, name: 'legFR' },
            { x: -0.18 * wFat * gW, z: -0.25 * aBody, front: false, name: 'legBL' },
            { x: 0.18 * wFat * gW, z: -0.25 * aBody, front: false, name: 'legBR' },
        ];

        for (const lp of legPositions) {
            const legH = (lp.front ? 0.28 : 0.26) * wLeg * aLeg;

            const legGroup = new THREE.Group();
            legGroup.position.set(lp.x, 0.28, lp.z);
            legGroup.userData = { legName: lp.name };

            // Noga — młode: cieńsze, senior: kościste
            const lt = age === 'young' ? legThick * 0.8 : legThick;
            const legMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(lt, lt * 1.1, legH, 8),
                furMat
            );
            legMesh.position.set(0, -legH / 2, 0);
            legGroup.add(legMesh);

            // Staw (kolano/łokieć — widoczny u seniorów)
            if (age === 'senior') {
                const jointGeo = new THREE.SphereGeometry(lt * 1.3, 6, 4);
                const joint = new THREE.Mesh(jointGeo, furMat);
                joint.position.set(0, -legH * 0.4, lp.front ? 0.02 : -0.02);
                legGroup.add(joint);
            }

            // Łapka
            const pawGeo = new THREE.SphereGeometry(pawSize, 8, 6);
            pawGeo.scale(1.0, 0.5, 1.1);
            const paw = new THREE.Mesh(pawGeo, furMat);
            paw.position.set(0, -legH + 0.02, lp.front ? 0.02 : -0.02);
            legGroup.add(paw);

            // Poduszka łapy
            const padGeo = new THREE.SphereGeometry(0.04, 6, 4);
            padGeo.scale(1.0, 0.3, 1.0);
            const pad = new THREE.Mesh(padGeo, pawPadMat);
            pad.position.set(0, -legH, 0);
            legGroup.add(pad);

            group.add(legGroup);
        }

        // ── OGON (zakrzywiony z segmentów) ──
        this._buildTail(group, furMat, aBody, gW);

        // ── WZORY FUTRA ──
        this._applyPattern(group, pattern, furColor, furMat);

        // Skala końcowa: wiek + płeć
        const finalScale = aScale * gOverall;
        group.scale.set(finalScale, finalScale, finalScale);
        group.userData = { type: 'cat' };

        return group;
    }

    /**
     * Zbuduj zakrzywiony ogon z segmentów.
     *
     * @param {Object} group
     * @param {Object} furMat
     * @param {number} [aBody=1] - mnożnik długości ciała (wiek)
     * @param {number} [gW=1] - mnożnik szerokości (płeć)
     * @private
     */
    _buildTail(group, furMat, aBody = 1, gW = 1) {
        const THREE = this._THREE;
        const segments = 7;
        const segLen = 0.10;
        let x = 0, y = 0.42, z = -0.50 * aBody;
        let angle = -0.6;

        for (let i = 0; i < segments; i++) {
            const radius = (0.04 - i * 0.004) * gW;
            const geo = new THREE.SphereGeometry(Math.max(radius, 0.012), 6, 6);
            geo.scale(1.0, 1.0, 1.8);
            const seg = new THREE.Mesh(geo, furMat);
            seg.position.set(x, y, z);
            seg.userData = { tailSegment: i };
            group.add(seg);

            angle += 0.16;
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
