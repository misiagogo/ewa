/**
 * PlayerControlled — marker komponent: encja sterowana przez lokalnego gracza.
 *
 * Komponent = tylko dane, zero logiki.
 */

class PlayerControlled {
    /** @type {boolean} */
    isLocal;

    /**
     * @param {boolean} [isLocal=true]
     */
    constructor(isLocal = true) {
        this.isLocal = isLocal;
    }
}

export default PlayerControlled;
