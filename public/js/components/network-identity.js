/**
 * NetworkIdentity — komponent identyfikujący encję w sieci.
 *
 * Komponent = tylko dane, zero logiki.
 * Mapuje encję ECS na server-side user ID.
 */

class NetworkIdentity {
    /** @type {number} Server-side user ID */
    userId;
    /** @type {boolean} Czy encja jest lokalna (nasz gracz) */
    isLocal;
    /** @type {number} Numer ostatniego potwierdzonego inputu */
    lastAckedSeq;

    /**
     * @param {number} userId
     * @param {boolean} [isLocal=false]
     */
    constructor(userId, isLocal = false) {
        this.userId = userId;
        this.isLocal = isLocal;
        this.lastAckedSeq = 0;
    }
}

export default NetworkIdentity;
