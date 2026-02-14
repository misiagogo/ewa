/**
 * PredictionSystem — client-side prediction i reconciliation.
 *
 * Gracz widzi swój ruch natychmiast (prediction).
 * Po otrzymaniu stanu serwera: porównaj z predykcją, skoryguj jeśli trzeba (reconciliation).
 * Działa tylko w multiplayer na encjach z PlayerControlled + NetworkIdentity.
 */

import Transform from '../components/transform.js';
import PlayerControlled from '../components/player-controlled.js';
import NetworkIdentity from '../components/network-identity.js';
import Debug from '../core/debug.js';
import EventBus from '../core/event-bus.js';

class PredictionSystem {
    /** @type {import('../network/input-buffer.js').default|null} */
    _inputBuffer = null;

    /** @type {boolean} */
    _enabled = false;

    /** @type {number} Próg korekcji — jeśli różnica > threshold, koryguj */
    _correctionThreshold = 0.5;

    /**
     * @param {Object} inputBuffer - InputBuffer instance
     */
    constructor(inputBuffer) {
        this._inputBuffer = inputBuffer;

        // Nasłuchuj na stan serwera
        EventBus.on('network:server-state', (data) => this._onServerState(data));
    }

    /**
     * Włącz/wyłącz system.
     *
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._enabled = enabled;
    }

    /**
     * @param {number} dt
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        // Prediction jest obsługiwana przez MovementSystem (input → velocity → position)
        // Ten system zajmuje się tylko reconciliation po otrzymaniu stanu serwera
    }

    /**
     * Reconciliation: porównaj stan serwera z predykcją.
     *
     * @param {Object} data - { userId, x, y, z, rotationY, ackedSeq }
     * @private
     */
    _onServerState(data) {
        if (!this._enabled || !this._inputBuffer) return;

        // Potwierdź inputy
        if (data.ackedSeq) {
            this._inputBuffer.ack(data.ackedSeq);
        }

        // Porównaj pozycję serwera z aktualną
        const dx = Math.abs(data.x - data.predictedX);
        const dz = Math.abs(data.z - data.predictedZ);

        if (dx > this._correctionThreshold || dz > this._correctionThreshold) {
            Debug.warning('prediction', 'Correction needed', { dx, dz });
            // Reconciliation: ustaw pozycję serwera i ponownie zastosuj niepotwierdzone inputy
            EventBus.emit('prediction:correct', {
                serverX: data.x,
                serverY: data.y,
                serverZ: data.z,
                serverRotY: data.rotationY,
                unackedInputs: this._inputBuffer.getUnacked(),
            });
        }
    }

    /**
     * Cleanup.
     */
    dispose() {
        EventBus.off('network:server-state', this._onServerState);
    }
}

export default PredictionSystem;
