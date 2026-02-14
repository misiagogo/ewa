/**
 * Saveable — marker komponent: encja, której stan powinien być zapisywany.
 *
 * Komponent = tylko dane, zero logiki.
 */

class Saveable {
    /** @type {boolean} Czy encja wymaga zapisu (dirty flag) */
    dirty;

    /** @type {number} Timestamp ostatniego zapisu */
    lastSavedAt;

    /**
     * @param {boolean} [dirty=false]
     */
    constructor(dirty = false) {
        this.dirty = dirty;
        this.lastSavedAt = 0;
    }
}

export default Saveable;
