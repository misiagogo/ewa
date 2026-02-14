/**
 * Cat Survival — punkt wejścia aplikacji.
 *
 * Inicjalizuje: Debug, Lang, ApiClient, StateMachine, GameLoop.
 * Rejestruje ekrany i uruchamia maszynę stanów od ekranu logowania.
 */

import Debug from './core/debug.js';
import EventBus from './core/event-bus.js';
import StateMachine from './core/state-machine.js';
import GameLoop from './core/game-loop.js';
import ApiClient from './core/api-client.js';
import { __, setLanguage } from './lang/lang.js';
import './lang/pl.js';
import './lang/en.js';

import LoginScreen from './screens/login-screen.js';
import WelcomeScreen from './screens/welcome-screen.js';
import SettingsScreen from './screens/settings-screen.js';
import LobbyScreen from './screens/lobby-screen.js';
import TerritoryScreen from './screens/territory-screen.js';
import CreatorScreen from './screens/creator-screen.js';
import GameScreen from './screens/game-screen.js';

// --- Inicjalizacja ---

Debug.init({
    enabled: true,
    minLevel: 'debug',
    flushCallback: (logs) => {
        ApiClient.post('/api/logs', { logs });
    },
});

ApiClient.init({ baseUrl: '' });

// Odczytaj token z sessionStorage (jeśli istnieje)
const savedToken = sessionStorage.getItem('cat_survival_token');
if (savedToken) {
    ApiClient.setToken(savedToken);
}

// --- State Machine ---

const stateMachine = new StateMachine();

stateMachine.add('login', new LoginScreen());
stateMachine.add('welcome', new WelcomeScreen());
stateMachine.add('settings', new SettingsScreen());
stateMachine.add('lobby', new LobbyScreen());
stateMachine.add('territory', new TerritoryScreen());
stateMachine.add('creator', new CreatorScreen());
stateMachine.add('game', new GameScreen());

// --- Game Loop ---

const gameLoop = new GameLoop((dt) => {
    stateMachine.update(dt);
});

// --- Start ---

// Jeśli mamy token → welcome, inaczej → login
if (savedToken) {
    stateMachine.change('welcome');
} else {
    stateMachine.change('login');
}

gameLoop.start();

Debug.info('app', 'Cat Survival initialized');

// Eksportuj globalne referencje (do użytku przez ekrany)
window.__catSurvival = {
    stateMachine,
    gameLoop,
};
