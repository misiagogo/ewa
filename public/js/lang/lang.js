/**
 * System tłumaczeń (i18n) — frontend.
 *
 * Funkcja __('key') zwraca tłumaczenie dla aktualnego języka.
 * Klucze w formacie 'screen.welcome.title', 'button.new_game'.
 *
 * @example
 * import { __, setLanguage } from './lang/lang.js';
 * setLanguage('pl');
 * const title = __('screen.welcome.title');
 */

import Debug from '../core/debug.js';

/** @type {string} */
let _currentLang = 'pl';

/** @type {Object<string, Object<string, string>>} */
const _translations = {
    pl: {},
    en: {},
};

/**
 * Ustaw aktywny język.
 *
 * @param {string} lang - Kod języka ('pl' lub 'en')
 */
export function setLanguage(lang) {
    if (_translations[lang]) {
        _currentLang = lang;
        Debug.info('lang', `Language set to: ${lang}`);
    } else {
        Debug.warning('lang', `Unknown language: ${lang}`);
    }
}

/**
 * Pobierz aktualny język.
 *
 * @returns {string}
 */
export function getLanguage() {
    return _currentLang;
}

/**
 * Zarejestruj tłumaczenia dla języka.
 *
 * @param {string} lang - Kod języka
 * @param {Object<string, string>} translations - Obiekt klucz→tłumaczenie
 */
export function registerTranslations(lang, translations) {
    if (!_translations[lang]) {
        _translations[lang] = {};
    }
    Object.assign(_translations[lang], translations);
}

/**
 * Pobierz tłumaczenie dla klucza.
 *
 * Zwraca klucz jeśli tłumaczenie nie istnieje (fallback).
 *
 * @param {string} key - Klucz tłumaczenia (np. 'screen.welcome.title')
 * @param {Object<string, string>} [params={}] - Parametry do podstawienia (:name)
 * @returns {string}
 */
export function __(key, params = {}) {
    let text = _translations[_currentLang]?.[key];

    // Fallback do angielskiego
    if (text === undefined) {
        text = _translations['en']?.[key];
    }

    // Fallback do klucza
    if (text === undefined) {
        Debug.warning('lang', `Missing translation: '${key}' [${_currentLang}]`);
        return key;
    }

    // Podstawienie parametrów (:name → value)
    for (const [param, value] of Object.entries(params)) {
        text = text.replace(`:${param}`, value);
    }

    return text;
}
