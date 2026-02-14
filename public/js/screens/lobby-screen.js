/**
 * LobbyScreen — ekran lobby multiplayer.
 *
 * Wyświetla listę publicznych pokoi, umożliwia tworzenie i dołączanie.
 */

import Debug from '../core/debug.js';
import ApiClient from '../core/api-client.js';
import EventBus from '../core/event-bus.js';
import { __ } from '../lang/lang.js';

class LobbyScreen {
    /** @type {Array} */
    _rooms = [];

    async enter() {
        this._renderLoading();
        await this._loadRooms();
        this._render();
    }

    exit() {
        document.getElementById('app').innerHTML = '';
    }

    update() {}

    /**
     * @private
     */
    _renderLoading() {
        document.getElementById('app').innerHTML = `
            <div class="game-screen">
                <div class="game-panel game-loading">
                    <div class="spinner-border text-danger" role="status"></div>
                </div>
            </div>
        `;
    }

    /**
     * @private
     */
    async _loadRooms() {
        const result = await ApiClient.get('/api/rooms');
        if (result.ok) {
            this._rooms = result.data.data || [];
        } else {
            Debug.error('lobby', 'Failed to load rooms');
            this._rooms = [];
        }
    }

    /**
     * @private
     */
    _render() {
        const roomsHtml = this._rooms.length > 0
            ? this._rooms.map((r) => `
                <div class="room-card d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${this._escapeHtml(r.name)}</strong>
                        <br><small class="text-muted">${__('screen.territory.' + r.territory)} &middot; ${__('screen.lobby.players', { count: r.players_count || 0, max: r.max_players })}</small>
                    </div>
                    <button class="btn btn-game btn-sm" data-join="${r.id}" style="width:auto;padding:0.4rem 1rem">${__('screen.lobby.join')}</button>
                </div>
            `).join('')
            : `<p class="text-center text-muted">${__('screen.lobby.status.waiting')}...</p>`;

        document.getElementById('app').innerHTML = `
            <div class="game-screen">
                <div class="game-panel" style="max-width:600px">
                    <h2 class="game-subtitle text-center mb-3">${__('screen.lobby.title')}</h2>
                    <div id="lobby-rooms" class="mb-3" style="max-height:300px;overflow-y:auto">
                        ${roomsHtml}
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-game" id="btn-create-room">${__('screen.lobby.create')}</button>
                        <button class="btn btn-game-secondary" id="btn-refresh">&#x21bb; Refresh</button>
                        <button class="btn btn-game-secondary" id="btn-back">${__('screen.lobby.back')}</button>
                    </div>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    /**
     * @private
     */
    _bindEvents() {
        document.getElementById('btn-back').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('welcome');
        });

        document.getElementById('btn-refresh').addEventListener('click', async () => {
            this._renderLoading();
            await this._loadRooms();
            this._render();
        });

        document.getElementById('btn-create-room').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('territory', { mode: 'multiplayer' });
        });

        document.querySelectorAll('[data-join]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const roomId = parseInt(btn.dataset.join);
                const room = this._rooms.find((r) => r.id === roomId);
                if (room) {
                    window.__catSurvival.stateMachine.change('creator', {
                        mode: 'multiplayer',
                        roomId: roomId,
                        territory: room.territory,
                    });
                }
            });
        });
    }

    /**
     * @param {string} str
     * @returns {string}
     * @private
     */
    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

export default LobbyScreen;
