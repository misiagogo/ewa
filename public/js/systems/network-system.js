/**
 * NetworkSystem — system ECS wysyłający pozycję lokalnego gracza do serwera.
 *
 * Działa tylko w trybie multiplayer. Wysyła pozycję co SEND_INTERVAL ms.
 * Odbiera pozycje innych graczy przez EventBus ('room:player-moved').
 */

import Transform from '../components/transform.js';
import PlayerControlled from '../components/player-controlled.js';
import ApiClient from '../core/api-client.js';
import EventBus from '../core/event-bus.js';
import Debug from '../core/debug.js';

class NetworkSystem {
    /** @type {number} Interwał wysyłania pozycji (ms) */
    static SEND_INTERVAL = 50;

    /** @type {number} */
    _timeSinceLastSend = 0;

    /** @type {number|null} */
    _roomId = null;

    /** @type {boolean} */
    _enabled = false;

    /**
     * Włącz system sieciowy dla pokoju.
     *
     * @param {number} roomId
     */
    enable(roomId) {
        this._roomId = roomId;
        this._enabled = true;
        Debug.info('network-system', `Enabled for room ${roomId}`);
    }

    /**
     * Wyłącz system sieciowy.
     */
    disable() {
        this._enabled = false;
        this._roomId = null;
    }

    /**
     * @param {number} dt - Delta time w sekundach
     * @param {import('../core/ecs.js').World} world
     */
    update(dt, world) {
        if (!this._enabled || !this._roomId) return;

        this._timeSinceLastSend += dt * 1000;

        if (this._timeSinceLastSend < NetworkSystem.SEND_INTERVAL) return;
        this._timeSinceLastSend = 0;

        // Znajdź lokalnego gracza
        const entities = world.query([Transform, PlayerControlled]);

        for (const entityId of entities) {
            const pc = world.getComponent(entityId, PlayerControlled);
            if (!pc.isLocal) continue;

            const transform = world.getComponent(entityId, Transform);

            // Wyślij pozycję przez API (lub whisper przez WsClient)
            EventBus.emit('network:send-position', {
                roomId: this._roomId,
                x: transform.x,
                y: transform.y,
                z: transform.z,
                rotationY: transform.rotationY,
            });
        }
    }
}

export default NetworkSystem;
