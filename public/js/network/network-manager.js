/**
 * NetworkManager — zarządzanie połączeniem multiplayer.
 *
 * Łączy WsClient z ECS World. Obsługuje:
 * - Dołączanie/opuszczanie pokoju
 * - Tworzenie/usuwanie encji zdalnych graczy
 * - Wysyłanie pozycji lokalnego gracza
 * - Odbieranie pozycji zdalnych graczy
 */

import Debug from '../core/debug.js';
import EventBus from '../core/event-bus.js';
import WsClient from '../core/ws-client.js';
import ApiClient from '../core/api-client.js';
import { createRemoteCatEntity } from '../entities/remote-cat-entity.js';
import { NetworkTransform } from '../systems/interpolation-system.js';
import Transform from '../components/transform.js';

class NetworkManager {
    /** @type {import('../core/ecs.js').World|null} */
    _world = null;

    /** @type {Object|null} Three.js Scene */
    _scene = null;

    /** @type {Object|null} Three.js module */
    _THREE = null;

    /** @type {number|null} */
    _roomId = null;

    /** @type {Map<number, number>} userId → entityId */
    _remoteEntities = new Map();

    /** @type {boolean} */
    _active = false;

    /**
     * Inicjalizacja z ECS World i sceną.
     *
     * @param {Object} world - ECS World
     * @param {Object} scene - Three.js Scene
     * @param {Object} THREE - Three.js module
     */
    init(world, scene, THREE) {
        this._world = world;
        this._scene = scene;
        this._THREE = THREE;

        // Nasłuchuj na eventy z WsClient
        EventBus.on('room:player-moved', (data) => this._onPlayerMoved(data));
        EventBus.on('room:player-joined', (data) => this._onPlayerJoined(data));
        EventBus.on('room:player-left', (data) => this._onPlayerLeft(data));
        EventBus.on('room:here', (data) => this._onHere(data));
        EventBus.on('network:send-position', (data) => this._sendPosition(data));

        Debug.info('network-manager', 'Initialized');
    }

    /**
     * Dołącz do pokoju multiplayer.
     *
     * @param {number} roomId
     * @param {string} token - Sanctum token
     */
    join(roomId, token) {
        this._roomId = roomId;
        this._active = true;

        WsClient.init({
            host: window.location.hostname,
            port: 8080,
            token: token,
        });

        WsClient.joinRoom(roomId);
        Debug.info('network-manager', `Joined room ${roomId}`);
    }

    /**
     * Opuść pokój.
     */
    leave() {
        if (this._roomId) {
            WsClient.leaveRoom();
            ApiClient.post(`/api/rooms/${this._roomId}/leave`);
        }

        // Usuń zdalne encje
        for (const [userId, entityId] of this._remoteEntities) {
            this._removeRemoteEntity(entityId);
        }
        this._remoteEntities.clear();

        this._active = false;
        this._roomId = null;
        Debug.info('network-manager', 'Left room');
    }

    /**
     * Wyślij pozycję lokalnego gracza na serwer.
     *
     * @param {Object} data - { roomId, x, y, z, rotationY }
     * @private
     */
    _sendPosition(data) {
        if (!this._active) return;

        // Whisper (client-to-client przez Reverb)
        WsClient.whisper('player-move', {
            x: data.x,
            y: data.y,
            z: data.z,
            rotationY: data.rotationY,
        });
    }

    /**
     * Odbiór pozycji zdalnego gracza.
     *
     * @param {Object} data - { user_id, x, y, z, rotation_y, tick }
     * @private
     */
    _onPlayerMoved(data) {
        if (!this._world) return;

        const entityId = this._remoteEntities.get(data.user_id);
        if (entityId === undefined) return;

        const netTransform = this._world.getComponent(entityId, NetworkTransform);
        if (netTransform) {
            netTransform.setTarget(data.x, data.y, data.z, data.rotation_y);
        }
    }

    /**
     * Nowy gracz dołączył do pokoju.
     *
     * @param {Object} data - { user_id, name, cat_config }
     * @private
     */
    _onPlayerJoined(data) {
        if (!this._world || !this._scene || !this._THREE) return;
        if (this._remoteEntities.has(data.user_id)) return;

        const entityId = createRemoteCatEntity(
            this._world, this._scene, this._THREE,
            data.cat_config || {},
            data.user_id,
            0, 0, 0
        );

        this._remoteEntities.set(data.user_id, entityId);
        Debug.info('network-manager', `Remote player spawned: ${data.user_id}`);
    }

    /**
     * Gracz opuścił pokój.
     *
     * @param {Object} data - { user_id }
     * @private
     */
    _onPlayerLeft(data) {
        const entityId = this._remoteEntities.get(data.user_id);
        if (entityId !== undefined) {
            this._removeRemoteEntity(entityId);
            this._remoteEntities.delete(data.user_id);
            Debug.info('network-manager', `Remote player removed: ${data.user_id}`);
        }
    }

    /**
     * Lista graczy już w pokoju (presence channel 'here').
     *
     * @param {Object} data - { roomId, users: [{id, name}] }
     * @private
     */
    _onHere(data) {
        Debug.info('network-manager', `Players in room: ${data.users?.length || 0}`);
    }

    /**
     * Usuń zdalną encję z ECS i sceny.
     *
     * @param {number} entityId
     * @private
     */
    _removeRemoteEntity(entityId) {
        if (!this._world) return;

        const renderable = this._world.getComponent(entityId, { name: 'Renderable' });
        if (renderable?.mesh) {
            this._scene.remove(renderable.mesh);
        }
        this._world.removeEntity(entityId);
    }

    /**
     * Czy manager jest aktywny (w pokoju).
     *
     * @returns {boolean}
     */
    get isActive() {
        return this._active;
    }

    /**
     * Cleanup.
     */
    dispose() {
        this.leave();
        EventBus.off('room:player-moved', this._onPlayerMoved);
        EventBus.off('room:player-joined', this._onPlayerJoined);
        EventBus.off('room:player-left', this._onPlayerLeft);
        EventBus.off('room:here', this._onHere);
        EventBus.off('network:send-position', this._sendPosition);
        this._world = null;
        this._scene = null;
        this._THREE = null;
    }
}

export default NetworkManager;
