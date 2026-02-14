/**
 * LoginScreen — ekran logowania i rejestracji.
 *
 * Obsługuje formularz logowania i przełączanie na rejestrację.
 * Po zalogowaniu zapisuje token w sessionStorage i przechodzi do welcome.
 */

import Debug from '../core/debug.js';
import ApiClient from '../core/api-client.js';
import EventBus from '../core/event-bus.js';
import { __ } from '../lang/lang.js';

class LoginScreen {
    /** @type {boolean} */
    _isRegister = false;

    /**
     * Wejście na ekran — renderuje formularz.
     */
    enter() {
        this._isRegister = false;
        this._render();
    }

    /**
     * Wyjście z ekranu — czyści DOM.
     */
    exit() {
        document.getElementById('app').innerHTML = '';
    }

    update() {}

    /**
     * Renderuj formularz logowania lub rejestracji.
     *
     * @private
     */
    _render() {
        const app = document.getElementById('app');

        if (this._isRegister) {
            app.innerHTML = `
                <div class="game-screen">
                    <div class="game-panel">
                        <h1 class="game-title">${__('screen.welcome.title')}</h1>
                        <h2 class="game-subtitle">${__('screen.register.title')}</h2>
                        <div id="auth-error" class="game-error d-none mb-3"></div>
                        <form id="auth-form">
                            <div class="mb-3">
                                <label class="game-label">${__('screen.register.name')}</label>
                                <input type="text" id="auth-name" class="form-control game-input" required>
                            </div>
                            <div class="mb-3">
                                <label class="game-label">${__('screen.register.email')}</label>
                                <input type="email" id="auth-email" class="form-control game-input" required>
                            </div>
                            <div class="mb-3">
                                <label class="game-label">${__('screen.register.password')}</label>
                                <input type="password" id="auth-password" class="form-control game-input" required minlength="8">
                            </div>
                            <div class="mb-3">
                                <label class="game-label">${__('screen.register.password_confirm')}</label>
                                <input type="password" id="auth-password-confirm" class="form-control game-input" required minlength="8">
                            </div>
                            <button type="submit" class="btn btn-game mb-3" id="auth-submit">${__('screen.register.submit')}</button>
                        </form>
                        <p class="text-center mb-0">
                            <span class="game-link" id="auth-toggle">${__('screen.register.login_link')}</span>
                        </p>
                    </div>
                </div>
            `;
        } else {
            app.innerHTML = `
                <div class="game-screen">
                    <div class="game-panel">
                        <h1 class="game-title">${__('screen.welcome.title')}</h1>
                        <h2 class="game-subtitle">${__('screen.login.title')}</h2>
                        <div id="auth-error" class="game-error d-none mb-3"></div>
                        <form id="auth-form">
                            <div class="mb-3">
                                <label class="game-label">${__('screen.login.email')}</label>
                                <input type="email" id="auth-email" class="form-control game-input" required>
                            </div>
                            <div class="mb-3">
                                <label class="game-label">${__('screen.login.password')}</label>
                                <input type="password" id="auth-password" class="form-control game-input" required>
                            </div>
                            <button type="submit" class="btn btn-game mb-3" id="auth-submit">${__('screen.login.submit')}</button>
                        </form>
                        <p class="text-center mb-0">
                            <span class="game-link" id="auth-toggle">${__('screen.login.register_link')}</span>
                        </p>
                    </div>
                </div>
            `;
        }

        this._bindEvents();
    }

    /**
     * Podłącz eventy formularza.
     *
     * @private
     */
    _bindEvents() {
        const form = document.getElementById('auth-form');
        const toggle = document.getElementById('auth-toggle');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit();
        });

        toggle.addEventListener('click', () => {
            this._isRegister = !this._isRegister;
            this._render();
        });
    }

    /**
     * Obsługa wysłania formularza (login lub register).
     *
     * @private
     */
    async _handleSubmit() {
        const errorEl = document.getElementById('auth-error');
        const submitBtn = document.getElementById('auth-submit');
        errorEl.classList.add('d-none');
        submitBtn.disabled = true;

        try {
            let result;

            if (this._isRegister) {
                result = await ApiClient.post('/api/register', {
                    name: document.getElementById('auth-name').value,
                    email: document.getElementById('auth-email').value,
                    password: document.getElementById('auth-password').value,
                    password_confirmation: document.getElementById('auth-password-confirm').value,
                });
            } else {
                result = await ApiClient.post('/api/login', {
                    email: document.getElementById('auth-email').value,
                    password: document.getElementById('auth-password').value,
                });
            }

            if (result.ok) {
                const token = result.data.token;
                ApiClient.setToken(token);
                sessionStorage.setItem('cat_survival_token', token);
                Debug.info('auth', this._isRegister ? 'Registered' : 'Logged in', { userId: result.data.user.id });
                EventBus.emit('auth:success', result.data.user);
                window.__catSurvival.stateMachine.change('welcome', result.data.user);
            } else {
                const msg = result.data?.message || result.data?.errors
                    ? Object.values(result.data.errors).flat().join(', ')
                    : __('error.network');
                errorEl.textContent = msg;
                errorEl.classList.remove('d-none');
            }
        } catch (err) {
            Debug.error('auth', 'Submit failed', { error: err.message });
            errorEl.textContent = __('error.network');
            errorEl.classList.remove('d-none');
        } finally {
            submitBtn.disabled = false;
        }
    }
}

export default LoginScreen;
