/**
 * SettingsScreen — ekran ustawień użytkownika.
 *
 * Pobiera ustawienia z API, wyświetla formularz, zapisuje zmiany.
 */

import Debug from '../core/debug.js';
import ApiClient from '../core/api-client.js';
import { __, setLanguage } from '../lang/lang.js';

class SettingsScreen {
    /** @type {Object|null} */
    _settings = null;

    async enter() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="game-screen">
                <div class="game-panel game-loading">
                    <div class="spinner-border text-danger" role="status"></div>
                </div>
            </div>
        `;

        const result = await ApiClient.get('/api/settings');
        if (result.ok) {
            this._settings = result.data.data;
            this._render();
        } else {
            Debug.error('settings', 'Failed to load settings');
            window.__catSurvival.stateMachine.change('welcome');
        }
    }

    exit() {
        document.getElementById('app').innerHTML = '';
    }

    update() {}

    /**
     * @private
     */
    _render() {
        const s = this._settings;
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="game-screen">
                <div class="game-panel">
                    <h2 class="game-subtitle text-center mb-4">${__('screen.settings.title')}</h2>
                    <div id="settings-msg" class="d-none mb-3"></div>
                    <form id="settings-form">
                        <div class="mb-3">
                            <label class="game-label">${__('screen.settings.language')}</label>
                            <select id="set-language" class="form-select game-input">
                                <option value="pl" ${s.language === 'pl' ? 'selected' : ''}>Polski</option>
                                <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="game-label">${__('screen.settings.graphics')}</label>
                            <select id="set-graphics" class="form-select game-input">
                                <option value="low" ${s.graphics_quality === 'low' ? 'selected' : ''}>${__('screen.settings.graphics.low')}</option>
                                <option value="medium" ${s.graphics_quality === 'medium' ? 'selected' : ''}>${__('screen.settings.graphics.medium')}</option>
                                <option value="high" ${s.graphics_quality === 'high' ? 'selected' : ''}>${__('screen.settings.graphics.high')}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="game-label">${__('screen.settings.view_distance')}: <span id="vd-val">${s.view_distance}</span></label>
                            <input type="range" id="set-view-distance" class="form-range" min="1" max="10" value="${s.view_distance}">
                        </div>
                        <div class="mb-3">
                            <label class="game-label">${__('screen.settings.sound')}: <span id="sv-val">${s.sound_volume}%</span></label>
                            <input type="range" id="set-sound" class="form-range" min="0" max="100" value="${s.sound_volume}">
                        </div>
                        <div class="mb-3 form-check form-switch">
                            <input type="checkbox" id="set-autosave" class="form-check-input" ${s.autosave_enabled ? 'checked' : ''}>
                            <label class="form-check-label game-label" for="set-autosave">${__('screen.settings.autosave')}</label>
                        </div>
                        <button type="submit" class="btn btn-game mb-2">${__('screen.settings.save')}</button>
                        <button type="button" class="btn btn-game-secondary" id="btn-back">${__('screen.settings.back')}</button>
                    </form>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    /**
     * @private
     */
    _bindEvents() {
        document.getElementById('set-view-distance').addEventListener('input', (e) => {
            document.getElementById('vd-val').textContent = e.target.value;
        });

        document.getElementById('set-sound').addEventListener('input', (e) => {
            document.getElementById('sv-val').textContent = e.target.value + '%';
        });

        document.getElementById('settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this._save();
        });

        document.getElementById('btn-back').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('welcome');
        });
    }

    /**
     * @private
     */
    async _save() {
        const msgEl = document.getElementById('settings-msg');
        const lang = document.getElementById('set-language').value;

        const result = await ApiClient.put('/api/settings', {
            language: lang,
            graphics_quality: document.getElementById('set-graphics').value,
            view_distance: parseInt(document.getElementById('set-view-distance').value),
            sound_volume: parseInt(document.getElementById('set-sound').value),
            autosave_enabled: document.getElementById('set-autosave').checked,
        });

        if (result.ok) {
            setLanguage(lang);
            msgEl.className = 'game-success mb-3';
            msgEl.textContent = __('success.settings_saved');
            Debug.info('settings', 'Settings saved');
        } else {
            msgEl.className = 'game-error mb-3';
            msgEl.textContent = result.data?.message || __('error.network');
        }
    }
}

export default SettingsScreen;
