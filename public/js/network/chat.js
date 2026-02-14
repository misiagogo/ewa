/**
 * Chat — system czatu multiplayer.
 *
 * Wysyła i odbiera wiadomości przez EventBus.
 * Sanityzuje wiadomości przed wyświetleniem.
 */

import Debug from '../core/debug.js';
import EventBus from '../core/event-bus.js';
import ApiClient from '../core/api-client.js';
import { __ } from '../lang/lang.js';

class Chat {
    /** @type {Array<Object>} Historia wiadomości */
    _messages = [];

    /** @type {number} Maksymalna liczba wiadomości w historii */
    _maxMessages;

    /** @type {HTMLElement|null} Kontener wiadomości */
    _messagesEl = null;

    /** @type {HTMLInputElement|null} Pole tekstowe */
    _inputEl = null;

    /** @type {boolean} */
    _visible = false;

    /**
     * @param {number} [maxMessages=50]
     */
    constructor(maxMessages = 50) {
        this._maxMessages = maxMessages;

        // Nasłuchuj na wiadomości z WebSocket
        EventBus.on('room:chat', (data) => this._onMessage(data));
    }

    /**
     * Renderuj UI czatu w kontenerze HUD.
     *
     * @param {HTMLElement} container - Kontener HUD
     */
    render(container) {
        const chatHtml = `
            <div class="game-chat" id="chat-container">
                <div class="game-chat-messages" id="chat-messages"></div>
                <div class="d-flex gap-1">
                    <input type="text" id="chat-input" class="form-control form-control-sm game-input"
                           placeholder="${__('screen.game.chat_placeholder')}" maxlength="200">
                    <button class="btn btn-sm btn-game" id="chat-send" type="button">&#x27A4;</button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', chatHtml);

        this._messagesEl = document.getElementById('chat-messages');
        this._inputEl = document.getElementById('chat-input');
        this._visible = true;

        this._bindEvents();
    }

    /**
     * @private
     */
    _bindEvents() {
        const sendBtn = document.getElementById('chat-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this._send());
        }

        if (this._inputEl) {
            this._inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._send();
                }
                // Zapobiegaj propagacji klawiszy do gry
                e.stopPropagation();
            });

            // Zapobiegaj propagacji keyup do InputSystem
            this._inputEl.addEventListener('keyup', (e) => e.stopPropagation());
        }
    }

    /**
     * Wyślij wiadomość.
     *
     * @private
     */
    _send() {
        if (!this._inputEl) return;

        const text = this._inputEl.value.trim();
        if (!text) return;

        this._inputEl.value = '';

        EventBus.emit('chat:send', { message: text });
        Debug.debug('chat', 'Sent message', { text });
    }

    /**
     * Odbiór wiadomości z WebSocket.
     *
     * @param {Object} data - { user_id, name, message }
     * @private
     */
    _onMessage(data) {
        const entry = {
            userId: data.user_id,
            name: this._escapeHtml(data.name || '???'),
            message: this._escapeHtml(data.message || ''),
            timestamp: new Date().toLocaleTimeString(),
        };

        this._messages.push(entry);
        if (this._messages.length > this._maxMessages) {
            this._messages.shift();
        }

        this._renderMessage(entry);
    }

    /**
     * Dodaj wiadomość do DOM.
     *
     * @param {Object} entry
     * @private
     */
    _renderMessage(entry) {
        if (!this._messagesEl) return;

        const msgEl = document.createElement('div');
        msgEl.innerHTML = `<small><strong>${entry.name}:</strong> ${entry.message}</small>`;
        this._messagesEl.appendChild(msgEl);

        // Auto-scroll
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    }

    /**
     * Sanityzacja HTML.
     *
     * @param {string} str
     * @returns {string}
     * @private
     */
    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Cleanup.
     */
    dispose() {
        EventBus.off('room:chat', this._onMessage);
        this._messages = [];
        this._messagesEl = null;
        this._inputEl = null;
        this._visible = false;
    }
}

export default Chat;
