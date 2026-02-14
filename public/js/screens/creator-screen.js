/**
 * CreatorScreen — kreator kota.
 *
 * Formularz: imię, kolor futra, wzór, kolor oczu, wiek, płeć.
 * Po zatwierdzeniu przechodzi do gry (singleplayer) lub dołącza do pokoju (multiplayer).
 *
 * Dane wejściowe: { mode, territory, roomId? }
 */

import Debug from '../core/debug.js';
import ApiClient from '../core/api-client.js';
import EventBus from '../core/event-bus.js';
import { __ } from '../lang/lang.js';

class CreatorScreen {
    /** @type {Object} */
    _data = {};

    /**
     * @param {Object} data - { mode, territory, roomId? }
     */
    enter(data) {
        this._data = data || {};
        this._render();
    }

    exit() {
        document.getElementById('app').innerHTML = '';
    }

    update() {}

    /**
     * @private
     */
    _render() {
        document.getElementById('app').innerHTML = `
            <div class="game-screen">
                <div class="game-panel" style="max-width:520px">
                    <h2 class="game-subtitle text-center mb-3">${__('screen.creator.title')}</h2>
                    <div id="creator-error" class="game-error d-none mb-3"></div>
                    <form id="creator-form">
                        <div class="mb-3">
                            <label class="game-label">${__('screen.creator.name')}</label>
                            <input type="text" id="cat-name" class="form-control game-input" required maxlength="50" value="Mruczek">
                        </div>
                        <div class="mb-3">
                            <label class="game-label">${__('screen.creator.fur_color')}</label>
                            <div class="d-flex align-items-center gap-2">
                                <input type="color" id="cat-fur-color" class="form-control form-control-color game-input" value="#ff8800">
                                <div class="color-preview" id="fur-preview" style="background-color:#ff8800"></div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="game-label">${__('screen.creator.pattern')}</label>
                            <select id="cat-pattern" class="form-select game-input">
                                <option value="solid">${__('screen.creator.pattern.solid')}</option>
                                <option value="striped" selected>${__('screen.creator.pattern.striped')}</option>
                                <option value="spotted">${__('screen.creator.pattern.spotted')}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="game-label">${__('screen.creator.eye_color')}</label>
                            <div class="d-flex align-items-center gap-2">
                                <input type="color" id="cat-eye-color" class="form-control form-control-color game-input" value="#00cc44">
                                <div class="color-preview" id="eye-preview" style="background-color:#00cc44"></div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <label class="game-label">${__('screen.creator.age')}</label>
                                <select id="cat-age" class="form-select game-input">
                                    <option value="young">${__('screen.creator.age.young')}</option>
                                    <option value="adult" selected>${__('screen.creator.age.adult')}</option>
                                    <option value="senior">${__('screen.creator.age.senior')}</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label class="game-label">${__('screen.creator.gender')}</label>
                                <select id="cat-gender" class="form-select game-input">
                                    <option value="male">${__('screen.creator.gender.male')}</option>
                                    <option value="female">${__('screen.creator.gender.female')}</option>
                                </select>
                            </div>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-game" id="btn-start">${__('screen.creator.start')}</button>
                            <button type="button" class="btn btn-game-secondary" id="btn-back">${__('screen.creator.back')}</button>
                        </div>
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
        document.getElementById('cat-fur-color').addEventListener('input', (e) => {
            document.getElementById('fur-preview').style.backgroundColor = e.target.value;
        });

        document.getElementById('cat-eye-color').addEventListener('input', (e) => {
            document.getElementById('eye-preview').style.backgroundColor = e.target.value;
        });

        document.getElementById('creator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleStart();
        });

        document.getElementById('btn-back').addEventListener('click', () => {
            window.__catSurvival.stateMachine.change('territory', { mode: this._data.mode });
        });
    }

    /**
     * Zbierz dane kota i przejdź do gry lub dołącz do pokoju.
     *
     * @private
     */
    async _handleStart() {
        const errorEl = document.getElementById('creator-error');
        const startBtn = document.getElementById('btn-start');
        errorEl.classList.add('d-none');
        startBtn.disabled = true;

        const catConfig = {
            name: document.getElementById('cat-name').value.trim(),
            fur_color: document.getElementById('cat-fur-color').value,
            pattern: document.getElementById('cat-pattern').value,
            eye_color: document.getElementById('cat-eye-color').value,
            age: document.getElementById('cat-age').value,
            gender: document.getElementById('cat-gender').value,
        };

        if (!catConfig.name) {
            errorEl.textContent = __('validation.required', { attribute: __('screen.creator.name') });
            errorEl.classList.remove('d-none');
            startBtn.disabled = false;
            return;
        }

        try {
            if (this._data.mode === 'multiplayer' && this._data.roomId) {
                // Dołącz do istniejącego pokoju
                const result = await ApiClient.post(`/api/rooms/${this._data.roomId}/join`, {
                    cat_config: catConfig,
                });

                if (result.ok) {
                    Debug.info('creator', 'Joined room', { roomId: this._data.roomId });
                    window.__catSurvival.stateMachine.change('game', {
                        mode: 'multiplayer',
                        territory: this._data.territory,
                        catConfig,
                        room: result.data.room?.data || result.data.room,
                    });
                } else {
                    errorEl.textContent = result.data?.message || __('error.network');
                    errorEl.classList.remove('d-none');
                }
            } else if (this._data.mode === 'multiplayer') {
                // Tworzenie nowego pokoju
                const result = await ApiClient.post('/api/rooms', {
                    name: catConfig.name + "'s Room",
                    territory: this._data.territory,
                    cat_config: catConfig,
                });

                if (result.ok) {
                    Debug.info('creator', 'Created room', { roomId: result.data.data?.id });
                    window.__catSurvival.stateMachine.change('game', {
                        mode: 'multiplayer',
                        territory: this._data.territory,
                        catConfig,
                        room: result.data.data,
                    });
                } else {
                    errorEl.textContent = result.data?.message || __('error.network');
                    errorEl.classList.remove('d-none');
                }
            } else {
                // Singleplayer — przejdź bezpośrednio do gry
                Debug.info('creator', 'Starting singleplayer', { territory: this._data.territory });
                EventBus.emit('game:start', {
                    mode: 'singleplayer',
                    territory: this._data.territory,
                    catConfig,
                });
                window.__catSurvival.stateMachine.change('game', {
                    mode: 'singleplayer',
                    territory: this._data.territory,
                    catConfig,
                });
            }
        } catch (err) {
            Debug.error('creator', 'Start failed', { error: err.message });
            errorEl.textContent = __('error.network');
            errorEl.classList.remove('d-none');
        } finally {
            startBtn.disabled = false;
        }
    }
}

export default CreatorScreen;
