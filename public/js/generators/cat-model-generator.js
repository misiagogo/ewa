/**
 * CatModelGenerator — ładuje model kota z pliku GLB i dostosowuje wygląd.
 *
 * Używa GLTFLoader do załadowania prawdziwego modelu 3D.
 * Dynamicznie zmienia kolor futra, oczu, skalę wg płci/wieku/wagi.
 * Cache'uje załadowany model — klonuje go dla każdej instancji.
 */

/** @type {Array<string>} Dostępne wzory futra */
export const FUR_PATTERNS = ['solid', 'striped', 'spotted', 'speckled', 'patched', 'bicolor'];

/** @type {string} Ścieżka do modelu GLB */
const CAT_MODEL_PATH = '/models/cat.glb';

class CatModelGenerator {
    /** @type {Object} Three.js module */
    _THREE;

    /** @type {Map<string, Object>} Cache materiałów */
    _materialCache = new Map();

    /** @type {Object|null} Załadowany oryginał modelu (do klonowania) */
    static _cachedGltfScene = null;

    /** @type {Promise|null} Promise ładowania (żeby nie ładować wielokrotnie) */
    static _loadPromise = null;

    /**
     * @param {Object} THREE - Three.js module
     */
    constructor(THREE) {
        this._THREE = THREE;
    }

    /**
     * Załaduj model GLB (cache'owany — ładuje się raz).
     *
     * @returns {Promise<Object>} Załadowana scena GLTF
     * @private
     */
    async _loadModel() {
        if (CatModelGenerator._cachedGltfScene) {
            return CatModelGenerator._cachedGltfScene;
        }

        if (CatModelGenerator._loadPromise) {
            return CatModelGenerator._loadPromise;
        }

        CatModelGenerator._loadPromise = new Promise((resolve, reject) => {
            const THREE = this._THREE;
            const loader = new THREE.GLTFLoader
                ? new THREE.GLTFLoader()
                : null;

            // GLTFLoader jest w three/addons — dynamiczny import
            if (!loader) {
                import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
                    const gltfLoader = new GLTFLoader();
                    gltfLoader.load(
                        CAT_MODEL_PATH,
                        (gltf) => {
                            CatModelGenerator._cachedGltfScene = gltf.scene;
                            resolve(gltf.scene);
                        },
                        undefined,
                        (err) => reject(err)
                    );
                }).catch(reject);
                return;
            }

            loader.load(
                CAT_MODEL_PATH,
                (gltf) => {
                    CatModelGenerator._cachedGltfScene = gltf.scene;
                    resolve(gltf.scene);
                },
                undefined,
                (err) => reject(err)
            );
        });

        return CatModelGenerator._loadPromise;
    }

    /**
     * Utwórz model kota z załadowanego GLB.
     *
     * Płeć, wiek i waga wpływają na skalę i proporcje.
     * Kolor futra i oczu zmieniany dynamicznie na materiałach.
     *
     * @param {Object} config - { furColor, pattern, eyeColor, age, gender, weight }
     * @returns {Promise<Object>} Three.js Group
     */
    async create(config = {}) {
        const THREE = this._THREE;

        const furColor = config.furColor || config.fur_color || '#ff8800';
        const eyeColor = config.eyeColor || config.eye_color || '#00cc44';
        const pattern = config.pattern || 'solid';
        const weight = parseFloat(config.weight) || 4.5;
        const gender = config.gender || 'male';
        const age = config.age || 'adult';

        let catModel;
        try {
            const original = await this._loadModel();
            catModel = original.clone();
        } catch (err) {
            // Fallback — prosty placeholder jeśli GLB się nie załaduje
            catModel = this._createFallback(furColor);
        }

        // ── Wrapper Group ──
        const group = new THREE.Group();
        group.add(catModel);

        // ── Zmiana koloru futra na wszystkich meshach ──
        const furMat = new THREE.MeshStandardMaterial({
            color: furColor,
            roughness: 0.85,
            metalness: 0.0,
        });

        catModel.traverse((child) => {
            if (child.isMesh) {
                child.material = furMat.clone();
                child.material.color.set(furColor);
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // ── Wpływ wzoru futra na kolor (modyfikacja odcienia) ──
        this._applyPatternToModel(catModel, pattern, furColor);

        // ── Skala wg płci ──
        const gScaleX = gender === 'male' ? 1.10 : 0.92;
        const gScaleY = gender === 'male' ? 1.05 : 0.97;
        const gScaleZ = gender === 'male' ? 1.08 : 0.94;

        // ── Skala wg wieku ──
        const aScale = age === 'young' ? 0.65 : age === 'senior' ? 1.02 : 1.0;

        // ── Skala wg wagi ──
        const wNorm = (weight - 2) / 10;
        const wScaleX = 0.90 + wNorm * 0.35;
        const wScaleY = 0.95 + wNorm * 0.15;
        const wScaleZ = 0.95 + wNorm * 0.15;

        // Kombinacja skal
        const sx = gScaleX * aScale * wScaleX;
        const sy = gScaleY * aScale * wScaleY;
        const sz = gScaleZ * aScale * wScaleZ;

        group.scale.set(sx, sy, sz);
        group.userData = { type: 'cat' };

        return group;
    }

    /**
     * Zastosuj wzór futra na załadowanym modelu (modyfikacja kolorów meshów).
     *
     * @param {Object} model - Three.js Object3D (sklonowany model)
     * @param {string} pattern
     * @param {string} furColor
     * @private
     */
    _applyPatternToModel(model, pattern, furColor) {
        if (pattern === 'solid') return;

        const THREE = this._THREE;
        const darkColor = this._darkenColor(furColor, 0.5);
        const lightColor = this._lightenColor(furColor, 1.4);

        const meshes = [];
        model.traverse((child) => {
            if (child.isMesh) meshes.push(child);
        });

        if (meshes.length === 0) return;

        switch (pattern) {
            case 'striped': {
                // Tabby — ciemniejszy odcień z vertex colors symulacją
                meshes.forEach((m) => {
                    m.material = m.material.clone();
                    m.material.color.set(furColor);
                    // Dodaj ciemniejszy odcień jako emissive hint
                    m.material.emissive = new THREE.Color(darkColor);
                    m.material.emissiveIntensity = 0.08;
                });
                break;
            }
            case 'spotted':
            case 'speckled': {
                meshes.forEach((m) => {
                    m.material = m.material.clone();
                    m.material.color.set(furColor);
                    m.material.emissive = new THREE.Color(darkColor);
                    m.material.emissiveIntensity = 0.05;
                });
                break;
            }
            case 'patched': {
                // Łaciaty — mieszanka kolorów
                meshes.forEach((m, idx) => {
                    m.material = m.material.clone();
                    m.material.color.set(idx % 2 === 0 ? furColor : darkColor);
                });
                break;
            }
            case 'bicolor': {
                // Dwukolorowy — jaśniejszy odcień
                meshes.forEach((m) => {
                    m.material = m.material.clone();
                    m.material.color.set(furColor);
                    m.material.emissive = new THREE.Color(lightColor);
                    m.material.emissiveIntensity = 0.06;
                });
                break;
            }
        }
    }

    /**
     * Fallback — prosty placeholder jeśli GLB się nie załaduje.
     *
     * @param {string} furColor
     * @returns {Object} Three.js Mesh
     * @private
     */
    _createFallback(furColor) {
        const THREE = this._THREE;
        const geo = new THREE.CapsuleGeometry(0.25, 0.5, 8, 12);
        const mat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.85 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0.4, 0);
        return mesh;
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
