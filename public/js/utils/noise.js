/**
 * Perlin Noise z seed — czysta funkcja, zero side effects.
 *
 * Deterministyczne generowanie: ten sam seed = ten sam wynik.
 * Implementacja oparta na Improved Perlin Noise (Ken Perlin, 2002).
 *
 * @example
 * const noise = new SeededNoise(12345);
 * const value = noise.noise2D(x * 0.02, z * 0.02); // -1..1
 * const fbm = noise.fbm2D(x, z, 4, 0.5, 2.0, 0.02); // fractal brownian motion
 */

class SeededNoise {
    /** @type {Uint8Array} */
    _perm;

    /**
     * @param {number} seed - Seed dla generatora
     */
    constructor(seed) {
        this._perm = this._buildPermutation(seed);
    }

    /**
     * Buduj tablicę permutacji z seed.
     *
     * @param {number} seed
     * @returns {Uint8Array}
     * @private
     */
    _buildPermutation(seed) {
        const p = new Uint8Array(512);
        const base = new Uint8Array(256);

        for (let i = 0; i < 256; i++) {
            base[i] = i;
        }

        // Fisher-Yates shuffle z seed
        let s = seed;
        for (let i = 255; i > 0; i--) {
            s = (s * 16807 + 0) % 2147483647;
            const j = s % (i + 1);
            const tmp = base[i];
            base[i] = base[j];
            base[j] = tmp;
        }

        for (let i = 0; i < 256; i++) {
            p[i] = base[i];
            p[i + 256] = base[i];
        }

        return p;
    }

    /**
     * Funkcja fade (6t^5 - 15t^4 + 10t^3).
     *
     * @param {number} t
     * @returns {number}
     * @private
     */
    _fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Interpolacja liniowa.
     *
     * @param {number} a
     * @param {number} b
     * @param {number} t
     * @returns {number}
     * @private
     */
    _lerp(a, b, t) {
        return a + t * (b - a);
    }

    /**
     * Gradient 2D.
     *
     * @param {number} hash
     * @param {number} x
     * @param {number} y
     * @returns {number}
     * @private
     */
    _grad2D(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Perlin Noise 2D.
     *
     * @param {number} x
     * @param {number} y
     * @returns {number} Wartość w zakresie ~[-1, 1]
     */
    noise2D(x, y) {
        const p = this._perm;

        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);

        const u = this._fade(xf);
        const v = this._fade(yf);

        const aa = p[p[xi] + yi];
        const ab = p[p[xi] + yi + 1];
        const ba = p[p[xi + 1] + yi];
        const bb = p[p[xi + 1] + yi + 1];

        return this._lerp(
            this._lerp(this._grad2D(aa, xf, yf), this._grad2D(ba, xf - 1, yf), u),
            this._lerp(this._grad2D(ab, xf, yf - 1), this._grad2D(bb, xf - 1, yf - 1), u),
            v
        );
    }

    /**
     * Fractal Brownian Motion 2D — wielooktawowy szum.
     *
     * @param {number} x - Współrzędna X (world space)
     * @param {number} y - Współrzędna Y/Z (world space)
     * @param {number} [octaves=4] - Liczba oktaw
     * @param {number} [persistence=0.5] - Zanikanie amplitudy
     * @param {number} [lacunarity=2.0] - Wzrost częstotliwości
     * @param {number} [scale=0.02] - Skala bazowa
     * @returns {number} Wartość w zakresie ~[0, 1]
     */
    fbm2D(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0, scale = 0.02) {
        let total = 0;
        let amplitude = 1;
        let frequency = scale;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        // Normalizuj do [0, 1]
        return (total / maxValue + 1) / 2;
    }
}

export default SeededNoise;
