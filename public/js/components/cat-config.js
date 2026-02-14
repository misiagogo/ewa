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
    /** @type {number} Waga kota w kg (2-12) */
    weight;

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
        this.weight = parseFloat(config.weight) || 4.5;
    }
}

export default CatConfig;
