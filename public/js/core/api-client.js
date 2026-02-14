/**
 * ApiClient — klient REST API z auto-token Sanctum.
 *
 * Wszystkie requesty REST przechodzą przez tę klasę.
 * Token Sanctum jest automatycznie dołączany do nagłówków.
 *
 * @example
 * ApiClient.setToken('abc123');
 * const saves = await ApiClient.get('/api/saves');
 * await ApiClient.post('/api/saves', { slot: 1, ... });
 */

import Debug from './debug.js';

class ApiClient {
    /** @type {string} */
    static _baseUrl = '';

    /** @type {string|null} */
    static _token = null;

    /**
     * Inicjalizacja klienta API.
     *
     * @param {Object} options
     * @param {string} [options.baseUrl=''] - Bazowy URL API
     */
    static init(options = {}) {
        ApiClient._baseUrl = options.baseUrl || '';
    }

    /**
     * Ustaw token Sanctum.
     *
     * @param {string|null} token
     */
    static setToken(token) {
        ApiClient._token = token;
    }

    /**
     * Pobierz aktualny token.
     *
     * @returns {string|null}
     */
    static getToken() {
        return ApiClient._token;
    }

    /**
     * Wykonaj request GET.
     *
     * @param {string} url - Ścieżka API (np. '/api/saves')
     * @returns {Promise<Object>}
     */
    static async get(url) {
        return ApiClient._request('GET', url);
    }

    /**
     * Wykonaj request POST.
     *
     * @param {string} url
     * @param {Object} [body=null]
     * @returns {Promise<Object>}
     */
    static async post(url, body = null) {
        return ApiClient._request('POST', url, body);
    }

    /**
     * Wykonaj request PUT.
     *
     * @param {string} url
     * @param {Object} [body=null]
     * @returns {Promise<Object>}
     */
    static async put(url, body = null) {
        return ApiClient._request('PUT', url, body);
    }

    /**
     * Wykonaj request DELETE.
     *
     * @param {string} url
     * @returns {Promise<Object>}
     */
    static async delete(url) {
        return ApiClient._request('DELETE', url);
    }

    /**
     * Wewnętrzna metoda wykonania requestu.
     *
     * @param {string} method - HTTP method
     * @param {string} url - Ścieżka API
     * @param {Object|null} [body=null] - Body requestu
     * @returns {Promise<Object>} Odpowiedź JSON
     * @private
     */
    static async _request(method, url, body = null) {
        const fullUrl = ApiClient._baseUrl + url;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (ApiClient._token) {
            headers['Authorization'] = `Bearer ${ApiClient._token}`;
        }

        const options = { method, headers };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        Debug.debug('api', `${method} ${url}`, body);

        try {
            const response = await fetch(fullUrl, options);
            const data = await response.json();

            if (!response.ok) {
                Debug.warning('api', `${method} ${url} → ${response.status}`, data);
                return { ok: false, status: response.status, data };
            }

            Debug.debug('api', `${method} ${url} → ${response.status}`);
            return { ok: true, status: response.status, data };
        } catch (err) {
            Debug.error('api', `${method} ${url} failed`, { error: err.message });
            return { ok: false, status: 0, data: null, error: err.message };
        }
    }
}

export default ApiClient;
