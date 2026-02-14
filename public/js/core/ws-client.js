/**
 * WsClient — klient WebSocket z auto-reconnect.
 *
 * Opakowuje Echo/Reverb. Obsługuje presence channels, private channels.
 * Auto-reconnect po zerwaniu połączenia.
 *
 * @example
 * WsClient.init({ host: 'localhost', port: 8080 });
 * WsClient.joinRoom(roomId, {
 *     onPlayerJoined: (data) => { ... },
 *     onPlayerMoved: (data) => { ... },
 * });
 */

import Debug from './debug.js';
import EventBus from './event-bus.js';

class WsClient {
    /** @type {Object|null} Echo instance */
    static _echo = null;

    /** @type {Object|null} Current presence channel */
    static _roomChannel = null;

    /** @type {number|null} Current room ID */
    static _roomId = null;

    /** @type {boolean} */
    static _connected = false;

    /**
     * Inicjalizacja klienta WebSocket.
     *
     * Wymaga załadowanego Laravel Echo i Pusher JS na stronie.
     *
     * @param {Object} options
     * @param {string} options.host - Host Reverb (np. 'localhost')
     * @param {number} options.port - Port Reverb (np. 8080)
     * @param {string} options.token - Token Sanctum do autoryzacji
     * @param {string} [options.scheme='http'] - Schemat (http/https)
     */
    static init(options = {}) {
        if (typeof window.Echo !== 'undefined') {
            Debug.warning('ws', 'Echo already initialized');
            return;
        }

        if (typeof window.Pusher === 'undefined') {
            Debug.error('ws', 'Pusher JS not loaded — WebSocket disabled');
            return;
        }

        try {
            window.Echo = new window.Echo({
                broadcaster: 'reverb',
                key: options.key || 'cat-survival-key',
                wsHost: options.host || 'localhost',
                wsPort: options.port || 8080,
                wssPort: options.port || 8080,
                forceTLS: options.scheme === 'https',
                enabledTransports: ['ws', 'wss'],
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${options.token}`,
                    },
                },
            });

            WsClient._echo = window.Echo;
            WsClient._connected = true;
            Debug.info('ws', 'Echo initialized', { host: options.host, port: options.port });
            EventBus.emit('ws:connected');
        } catch (err) {
            Debug.error('ws', 'Echo init failed', { error: err.message });
        }
    }

    /**
     * Dołącz do kanału presence pokoju.
     *
     * @param {number} roomId
     * @param {Object} handlers - Callbacki eventów
     * @param {Function} [handlers.onPlayerJoined]
     * @param {Function} [handlers.onPlayerLeft]
     * @param {Function} [handlers.onPlayerMoved]
     * @param {Function} [handlers.onChatMessage]
     * @param {Function} [handlers.onHere] - Lista graczy już w pokoju
     * @param {Function} [handlers.onJoining] - Nowy gracz dołącza
     * @param {Function} [handlers.onLeaving] - Gracz opuszcza
     */
    static joinRoom(roomId, handlers = {}) {
        if (!WsClient._echo) {
            Debug.error('ws', 'Echo not initialized');
            return;
        }

        // Opuść poprzedni pokój
        if (WsClient._roomChannel) {
            WsClient.leaveRoom();
        }

        WsClient._roomId = roomId;
        const channelName = `room.${roomId}`;

        WsClient._roomChannel = WsClient._echo.join(channelName)
            .here((users) => {
                Debug.info('ws', `Room ${roomId}: ${users.length} players present`);
                if (handlers.onHere) handlers.onHere(users);
                EventBus.emit('room:here', { roomId, users });
            })
            .joining((user) => {
                Debug.info('ws', `Room ${roomId}: player joining`, user);
                if (handlers.onJoining) handlers.onJoining(user);
                EventBus.emit('room:joining', { roomId, user });
            })
            .leaving((user) => {
                Debug.info('ws', `Room ${roomId}: player leaving`, user);
                if (handlers.onLeaving) handlers.onLeaving(user);
                EventBus.emit('room:leaving', { roomId, user });
            })
            .listen('PlayerJoined', (data) => {
                if (handlers.onPlayerJoined) handlers.onPlayerJoined(data);
                EventBus.emit('room:player-joined', data);
            })
            .listen('PlayerLeft', (data) => {
                if (handlers.onPlayerLeft) handlers.onPlayerLeft(data);
                EventBus.emit('room:player-left', data);
            })
            .listen('PlayerMoved', (data) => {
                if (handlers.onPlayerMoved) handlers.onPlayerMoved(data);
                EventBus.emit('room:player-moved', data);
            })
            .listen('ChatMessage', (data) => {
                if (handlers.onChatMessage) handlers.onChatMessage(data);
                EventBus.emit('room:chat', data);
            });

        Debug.info('ws', `Joined room channel: ${channelName}`);
    }

    /**
     * Opuść aktualny kanał pokoju.
     */
    static leaveRoom() {
        if (WsClient._echo && WsClient._roomId) {
            WsClient._echo.leave(`room.${WsClient._roomId}`);
            Debug.info('ws', `Left room channel: room.${WsClient._roomId}`);
            WsClient._roomChannel = null;
            WsClient._roomId = null;
        }
    }

    /**
     * Wyślij event whisper (client-to-client, bez serwera).
     *
     * @param {string} event - Nazwa eventu
     * @param {Object} data - Dane
     */
    static whisper(event, data) {
        if (WsClient._roomChannel) {
            WsClient._roomChannel.whisper(event, data);
        }
    }

    /**
     * Czy klient jest połączony.
     *
     * @returns {boolean}
     */
    static get isConnected() {
        return WsClient._connected;
    }

    /**
     * Rozłącz klienta WebSocket.
     */
    static disconnect() {
        WsClient.leaveRoom();
        if (WsClient._echo) {
            WsClient._echo.disconnect();
            WsClient._echo = null;
            WsClient._connected = false;
            Debug.info('ws', 'Disconnected');
            EventBus.emit('ws:disconnected');
        }
    }
}

export default WsClient;
