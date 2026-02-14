/**
 * Narzędzia matematyczne — czyste funkcje, zero side effects.
 *
 * @example
 * import { lerp, clamp, randomRange } from './utils/math-utils.js';
 * const smoothed = lerp(current, target, 0.05);
 */

/**
 * Interpolacja liniowa.
 *
 * @param {number} a - Wartość początkowa
 * @param {number} b - Wartość docelowa
 * @param {number} t - Współczynnik (0-1)
 * @returns {number}
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Ogranicz wartość do zakresu [min, max].
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Losowa liczba z zakresu [min, max].
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Losowa liczba całkowita z zakresu [min, max] (włącznie).
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Odległość 2D między dwoma punktami.
 *
 * @param {number} x1
 * @param {number} z1
 * @param {number} x2
 * @param {number} z2
 * @returns {number}
 */
export function distance2D(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Konwersja stopni na radiany.
 *
 * @param {number} degrees
 * @returns {number}
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Konwersja radianów na stopnie.
 *
 * @param {number} radians
 * @returns {number}
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}
