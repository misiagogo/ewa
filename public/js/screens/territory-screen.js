/**
 * TerritoryScreen — ekran wyboru terytorium (biomu).
 *
 * Wyświetla karty terytoriów. Po wyborze przechodzi do kreatora kota.
 * Dane wejściowe: { mode: 'singleplayer'|'multiplayer' }
 */

import { __ } from '../lang/lang.js';

/** @type {Array<{id: string, color: string}>} */
const TERRITORIES = [
    { id: 'pine_forest', color: '#2d5a27' },
    { id: 'deciduous_forest', color: '#4a7c3f' },
    { id: 'desert', color: '#c2a645' },
    { id: 'mountains', color: '#6b6b6b' },
    { id: 'swamp', color: '#3a5a3a' },
];

class TerritoryScreen {
    /** @type {string|null} */
    _selected = null;

    /** @type {Object} */
    _data = {};

    /**
     * @param {Object} data - { mode: 'singleplayer'|'multiplayer' }
     */
    enter(data) {
        this._data = data || {};
        this._selected = null;
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
        const cards = TERRITORIES.map((t) => `
            <div class="col-6 col-md-4 mb-3">
                <div class="territory-card ${this._selected === t.id ? 'selected' : ''}" data-territory="${t.id}">
                    <div class="color-preview mb-2" style="background-color:${t.color};width:60px;height:60px;margin:0 auto;border-radius:12px"></div>
                    <strong>${__('screen.territory.' + t.id)}</strong>
                </div>
            </div>
        `).join('');

        document.getElementById('app').innerHTML = `
            <div class="game-screen">
                <div class="game-panel" style="max-width:600px">
                    <h2 class="game-subtitle text-center mb-4">${__('screen.territory.title')}</h2>
                    <div class="row" id="territory-grid">
                        ${cards}
                    </div>
                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-game" id="btn-select" disabled>${__('screen.territory.select')}</button>
                        <button class="btn btn-game-secondary" id="btn-back">${__('button.back')}</button>
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
        document.querySelectorAll('.territory-card').forEach((card) => {
            card.addEventListener('click', () => {
                this._selected = card.dataset.territory;
                // Aktualizuj wizualnie
                document.querySelectorAll('.territory-card').forEach((c) => c.classList.remove('selected'));
                card.classList.add('selected');
                document.getElementById('btn-select').disabled = false;
            });
        });

        document.getElementById('btn-select').addEventListener('click', () => {
            if (!this._selected) return;
            window.__catSurvival.stateMachine.change('creator', {
                mode: this._data.mode || 'singleplayer',
                territory: this._selected,
            });
        });

        document.getElementById('btn-back').addEventListener('click', () => {
            if (this._data.mode === 'multiplayer') {
                window.__catSurvival.stateMachine.change('lobby');
            } else {
                window.__catSurvival.stateMachine.change('welcome');
            }
        });
    }
}

export default TerritoryScreen;
