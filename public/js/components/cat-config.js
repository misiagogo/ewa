/**
 * CatConfig — komponent konfiguracji kota (wygląd).
 *
 * Komponent = tylko dane, zero logiki.
 */

class CatConfig {
    /** @type {string} */
    name;
    /** @type {string} */
    furColor;
    /** @type {string} */
    pattern;
    /** @type {string} */
    eyeColor;
    /** @type {string} */
    age;
    /** @type {string} */
    gender;

    /**
     * @param {Object} [config={}]
     */
    constructor(config = {}) {
        this.name = config.name || 'Cat';
        this.furColor = config.fur_color || config.furColor || '#ff8800';
        this.pattern = config.pattern || 'striped';
        this.eyeColor = config.eye_color || config.eyeColor || '#00cc44';
        this.age = config.age || 'adult';
        this.gender = config.gender || 'male';
    }
}

export default CatConfig;
