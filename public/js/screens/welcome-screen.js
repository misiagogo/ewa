/**
 * WelcomeScreen — ekran powitalny po zalogowaniu.
 *
 * Opcje: Gra jednoosobowa, Multiplayer, Ustawienia, Wyloguj.
 */

import Debug from '../core/debug.js';
import ApiClient from '../core/api-client.js';
import EventBus from '../core/event-bus.js';
import { __ } from '../lang/lang.js';

class WelcomeScreen {
    /**
     * Wejście na ekran.
     */
    enter() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="game-screen">
                <div class="game-panel text-center">
                    <h1 class="game-title">${__('screen.welcome.title')}</h1>
                    <p class="game-subtitle">${__('screen.welcome.subtitle')}</p>
                    <div class="d-grid gap-3 mt-4">
                        <button class="btn btn-game" id="btn-singleplayer">${__('screen.welcome.singleplayer')}</button>
                        <button class="btn btn-game" id="btn-multiplayer">${__('screen.welcome.multiplayer')}</button>
                        <button class="btn btn-game-secondary" id="btn-settings">${__('screen.welcome.settings')}</button>
                        <button class="btn btn-game-secondary" id="btn-logout">${__('screen.welcome.logout')}</button>
                    </div>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    exit() {
        document.getElementById('app').innerHTML = '';
    }

    update() {}

    /**
     * @private
     */
    _bindEvents() {
        document.getElementById('btn-singleplayer').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('territory', { mode: 'singleplayer' });
        });

        document.getElementById('btn-multiplayer').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('lobby');
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('settings');
        });

        document.getElementById('btn-logout').addEventListener('click', async () => {
            await ApiClient.post('/api/logout');
            ApiClient.setToken(null);
            sessionStorage.removeItem('cat_survival_token');
            Debug.info('auth', 'Logged out');
            EventBus.emit('auth:logout');
            window.__catSurvival.stateMachine.change('login');
        });
    }
}

export default WelcomeScreen;
