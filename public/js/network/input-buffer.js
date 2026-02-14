/**
 * InputBuffer — bufor inputów z numerem sekwencji.
 *
 * Przechowuje inputy wysłane do serwera, czekające na potwierdzenie.
 * Używane do client-side prediction i reconciliation.
 */

import Debug from '../core/debug.js';

class InputBuffer {
    /** @type {Array<Object>} Bufor inputów */
    _buffer = [];

    /** @type {number} Numer sekwencji */
    _seq = 0;

    /** @type {number} Maksymalny rozmiar bufora */
    _maxSize;

    /**
     * @param {number} [maxSize=128]
     */
    constructor(maxSize = 128) {
        this._maxSize = maxSize;
    }

    /**
     * Dodaj input do bufora.
     *
     * @param {Object} input - { forward, backward, left, right, rotateLeft, rotateRight }
     * @param {number} dt - Delta time
     * @returns {number} Numer sekwencji
     */
    push(input, dt) {
        this._seq++;

        const entry = {
            seq: this._seq,
            input: { ...input },
            dt,
            timestamp: performance.now(),
        };

        this._buffer.push(entry);

        // Ogranicz rozmiar bufora
        if (this._buffer.length > this._maxSize) {
            this._buffer.shift();
        }

        return this._seq;
    }

    /**
     * Potwierdź inputy do podanego numeru sekwencji (włącznie).
     * Usuwa potwierdzone inputy z bufora.
     *
     * @param {number} ackedSeq - Numer sekwencji potwierdzonej przez serwer
     */
    ack(ackedSeq) {
        this._buffer = this._buffer.filter((entry) => entry.seq > ackedSeq);
    }

    /**
     * Pobierz niepotwierdzone inputy (do ponownego zastosowania po reconciliation).
     *
     * @returns {Array<Object>}
     */
    getUnacked() {
        return [...this._buffer];
    }

    /**
     * Aktualny numer sekwencji.
     *
     * @returns {number}
     */
    get currentSeq() {
        return this._seq;
    }

    /**
     * Liczba niepotwierdzonych inputów.
     *
     * @returns {number}
     */
    get pendingCount() {
        return this._buffer.length;
    }

    /**
     * Wyczyść bufor.
     */
    clear() {
        this._buffer = [];
        this._seq = 0;
    }
}

export default InputBuffer;
