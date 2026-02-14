/**
 * RemotePlayer — marker komponent: encja sterowana przez sieć (inny gracz).
 *
 * Komponent = tylko dane, zero logiki.
 */

class RemotePlayer {
    /** @type {number} Server-side user ID */
    userId;
    /** @type {string} Nazwa gracza */
    name;

    /**
     * @param {number} userId
     * @param {string} [name='']
     */
    constructor(userId, name = '') {
        this.userId = userId;
        this.name = name;
    }
}

export default RemotePlayer;
