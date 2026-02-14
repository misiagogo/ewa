/**
 * StateBuffer — bufor stanów serwera do interpolacji zdalnych graczy.
 *
 * Przechowuje ostatnie N stanów z serwera per gracz.
 * InterpolationSystem interpoluje między dwoma ostatnimi stanami.
 */

class StateBuffer {
    /** @type {Map<number, Array<Object>>} userId → [{ x, y, z, rotY, tick, timestamp }] */
    _buffers = new Map();

    /** @type {number} Maksymalna liczba stanów per gracz */
    _maxStates;

    /**
     * @param {number} [maxStates=10]
     */
    constructor(maxStates = 10) {
        this._maxStates = maxStates;
    }

    /**
     * Dodaj stan serwera dla gracza.
     *
     * @param {number} userId
     * @param {Object} state - { x, y, z, rotationY, tick }
     */
    push(userId, state) {
        if (!this._buffers.has(userId)) {
            this._buffers.set(userId, []);
        }

        const buffer = this._buffers.get(userId);
        buffer.push({
            x: state.x,
            y: state.y,
            z: state.z,
            rotY: state.rotationY || state.rotation_y || 0,
            tick: state.tick || 0,
            timestamp: performance.now(),
        });

        // Ogranicz rozmiar
        if (buffer.length > this._maxStates) {
            buffer.shift();
        }
    }

    /**
     * Pobierz dwa ostatnie stany gracza (do interpolacji).
     *
     * @param {number} userId
     * @returns {{from: Object|null, to: Object|null}}
     */
    getInterpolationPair(userId) {
        const buffer = this._buffers.get(userId);
        if (!buffer || buffer.length < 2) {
            return { from: null, to: buffer?.[0] || null };
        }

        return {
            from: buffer[buffer.length - 2],
            to: buffer[buffer.length - 1],
        };
    }

    /**
     * Pobierz ostatni stan gracza.
     *
     * @param {number} userId
     * @returns {Object|null}
     */
    getLatest(userId) {
        const buffer = this._buffers.get(userId);
        if (!buffer || buffer.length === 0) return null;
        return buffer[buffer.length - 1];
    }

    /**
     * Usuń bufor gracza.
     *
     * @param {number} userId
     */
    remove(userId) {
        this._buffers.delete(userId);
    }

    /**
     * Wyczyść wszystkie bufory.
     */
    clear() {
        this._buffers.clear();
    }
}

export default StateBuffer;
