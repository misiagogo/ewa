/**
 * ECS — Entity Component System.
 *
 * World zarządza encjami, komponentami i systemami.
 * Entity = ID. Component = dane. System = logika.
 *
 * @example
 * const world = new World();
 * const id = world.createEntity();
 * world.addComponent(id, new Transform(10, 0, 20));
 * world.addSystem(new MovementSystem());
 * world.update(dt);
 */

import Debug from './debug.js';

/** @type {number} */
let _nextEntityId = 1;

/**
 * World — kontener ECS. Przechowuje encje, komponenty i systemy.
 */
class World {
    /** @type {Set<number>} */
    _entities = new Set();

    /** @type {Map<number, Map<string, Object>>} */
    _components = new Map();

    /** @type {Array<Object>} */
    _systems = [];

    /**
     * Utwórz nową encję.
     *
     * @returns {number} ID nowej encji
     */
    createEntity() {
        const id = _nextEntityId++;
        this._entities.add(id);
        this._components.set(id, new Map());
        Debug.debug('ecs', `Entity created: ${id}`);
        return id;
    }

    /**
     * Usuń encję i wszystkie jej komponenty.
     *
     * @param {number} entityId
     */
    removeEntity(entityId) {
        this._entities.delete(entityId);
        this._components.delete(entityId);
        Debug.debug('ecs', `Entity removed: ${entityId}`);
    }

    /**
     * Dodaj komponent do encji.
     *
     * @param {number} entityId
     * @param {Object} component - Instancja komponentu
     */
    addComponent(entityId, component) {
        const entityComponents = this._components.get(entityId);
        if (!entityComponents) {
            Debug.error('ecs', `Entity ${entityId} not found`);
            return;
        }
        const name = component.constructor.name;
        entityComponents.set(name, component);
    }

    /**
     * Pobierz komponent encji po klasie.
     *
     * @param {number} entityId
     * @param {Function} componentClass - Klasa komponentu
     * @returns {Object|null}
     */
    getComponent(entityId, componentClass) {
        const entityComponents = this._components.get(entityId);
        if (!entityComponents) return null;
        return entityComponents.get(componentClass.name) || null;
    }

    /**
     * Sprawdź czy encja ma komponent.
     *
     * @param {number} entityId
     * @param {Function} componentClass
     * @returns {boolean}
     */
    hasComponent(entityId, componentClass) {
        const entityComponents = this._components.get(entityId);
        if (!entityComponents) return false;
        return entityComponents.has(componentClass.name);
    }

    /**
     * Usuń komponent z encji.
     *
     * @param {number} entityId
     * @param {Function} componentClass
     */
    removeComponent(entityId, componentClass) {
        const entityComponents = this._components.get(entityId);
        if (entityComponents) {
            entityComponents.delete(componentClass.name);
        }
    }

    /**
     * Zapytanie: znajdź encje posiadające WSZYSTKIE podane komponenty.
     *
     * @param {Array<Function>} componentClasses - Lista klas komponentów
     * @returns {Array<number>} Lista ID encji
     */
    query(componentClasses) {
        const results = [];
        for (const entityId of this._entities) {
            let hasAll = true;
            for (const cls of componentClasses) {
                if (!this.hasComponent(entityId, cls)) {
                    hasAll = false;
                    break;
                }
            }
            if (hasAll) {
                results.push(entityId);
            }
        }
        return results;
    }

    /**
     * Dodaj system do świata.
     *
     * @param {Object} system - Obiekt z metodą update(dt, world)
     */
    addSystem(system) {
        this._systems.push(system);
        Debug.debug('ecs', `System added: ${system.constructor.name}`);
    }

    /**
     * Aktualizuj wszystkie systemy (wywoływane co klatkę).
     *
     * @param {number} dt - Delta time w sekundach
     */
    update(dt) {
        for (const system of this._systems) {
            system.update(dt, this);
        }
    }

    /**
     * Liczba aktywnych encji.
     *
     * @returns {number}
     */
    get entityCount() {
        return this._entities.size;
    }

    /**
     * Pobierz wszystkie ID encji.
     *
     * @returns {Array<number>}
     */
    get entities() {
        return [...this._entities];
    }
}

export { World };
