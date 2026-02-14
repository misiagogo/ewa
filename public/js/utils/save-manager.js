/**
 * SaveManager — serializacja stanu gry → API, deserializacja → ECS World.
 *
 * Obsługuje zapis ręczny (sloty 1-3) i autosave (slot 0).
 * Komunikuje się z backendem przez ApiClient.
 */

import Debug from '../core/debug.js';
import ApiClient from '../core/api-client.js';
import EventBus from '../core/event-bus.js';
import { __ } from '../lang/lang.js';
import Transform from '../components/transform.js';
import CatConfig from '../components/cat-config.js';
import PlayerControlled from '../components/player-controlled.js';

class SaveManager {
    /**
     * Serializuj stan gry z ECS World do obiektu JSON.
     *
     * @param {import('../core/ecs.js').World} world
     * @param {Object} gameData - { territory, seed, mode }
     * @returns {Object} { territory, cat_config, game_state }
     */
    static serialize(world, gameData) {
        let catConfigData = {};
        let playerPosition = { x: 0, y: 0, z: 0, rotationY: 0 };

        // Znajdź lokalnego gracza
        const entities = world.query([Transform, PlayerControlled]);
        for (const entityId of entities) {
            const pc = world.getComponent(entityId, PlayerControlled);
            if (!pc.isLocal) continue;

            const transform = world.getComponent(entityId, Transform);
            playerPosition = {
                x: transform.x,
                y: transform.y,
                z: transform.z,
                rotationY: transform.rotationY,
            };

            const catCfg = world.getComponent(entityId, CatConfig);
            if (catCfg) {
                catConfigData = {
                    name: catCfg.name,
                    fur_color: catCfg.furColor,
                    pattern: catCfg.pattern,
                    eye_color: catCfg.eyeColor,
                    age: catCfg.age,
                    gender: catCfg.gender,
                };
            }
            break;
        }

        return {
            territory: gameData.territory || 'pine_forest',
            cat_config: catConfigData,
            game_state: {
                world_seed: gameData.seed || 0,
                position: playerPosition,
                mode: gameData.mode || 'singleplayer',
            },
        };
    }

    /**
     * Zapisz grę do slotu (1-3).
     *
     * @param {import('../core/ecs.js').World} world
     * @param {Object} gameData
     * @param {number} slot - 1, 2 lub 3
     * @param {string} [name=''] - Nazwa save'a
     * @returns {Promise<boolean>}
     */
    static async save(world, gameData, slot, name = '') {
        const data = SaveManager.serialize(world, gameData);
        data.slot = slot;
        data.name = name || `Save ${slot}`;

        const result = await ApiClient.post('/api/saves', data);

        if (result.ok) {
            Debug.info('save-manager', `Game saved to slot ${slot}`);
            EventBus.emit('save:success', { slot });
            return true;
        } else {
            Debug.error('save-manager', 'Save failed', result.data);
            EventBus.emit('save:failed', { slot, error: result.data });
            return false;
        }
    }

    /**
     * Autosave (slot 0).
     *
     * @param {import('../core/ecs.js').World} world
     * @param {Object} gameData
     * @returns {Promise<boolean>}
     */
    static async autosave(world, gameData) {
        const data = SaveManager.serialize(world, gameData);

        const result = await ApiClient.post('/api/saves/autosave', data);

        if (result.ok) {
            Debug.debug('save-manager', 'Autosave completed');
            return true;
        } else {
            Debug.warning('save-manager', 'Autosave failed', result.data);
            return false;
        }
    }

    /**
     * Załaduj listę save'ów użytkownika.
     *
     * @returns {Promise<Array>}
     */
    static async listSaves() {
        const result = await ApiClient.get('/api/saves');
        if (result.ok) {
            return result.data.data || [];
        }
        return [];
    }

    /**
     * Załaduj save i zwróć dane do deserializacji.
     *
     * @param {number} saveId
     * @returns {Promise<Object|null>}
     */
    static async load(saveId) {
        const result = await ApiClient.get(`/api/saves/${saveId}`);
        if (result.ok) {
            Debug.info('save-manager', `Save loaded: ${saveId}`);
            return result.data.data;
        }
        Debug.error('save-manager', `Load failed: ${saveId}`);
        return null;
    }

    /**
     * Usuń save.
     *
     * @param {number} saveId
     * @returns {Promise<boolean>}
     */
    static async deleteSave(saveId) {
        const result = await ApiClient.delete(`/api/saves/${saveId}`);
        return result.ok;
    }
}

export default SaveManager;
