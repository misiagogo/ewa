/**
 * MobileUtils — narzędzia mobilne: performance profiles, splash, status bar, haptics.
 *
 * Używa Capacitor plugins jeśli dostępne.
 * Na desktopie metody są no-op.
 */

import Debug from '../core/debug.js';

class MobileUtils {
    /** @type {boolean} */
    static _isCapacitor = typeof window.Capacitor !== 'undefined';

    /**
     * Ukryj splash screen (Capacitor).
     */
    static async hideSplash() {
        if (!MobileUtils._isCapacitor) return;

        try {
            const { SplashScreen } = await import('@capacitor/splash-screen');
            await SplashScreen.hide();
            Debug.info('mobile', 'Splash screen hidden');
        } catch (err) {
            Debug.debug('mobile', 'SplashScreen plugin not available');
        }
    }

    /**
     * Ukryj status bar (fullscreen w grze).
     */
    static async hideStatusBar() {
        if (!MobileUtils._isCapacitor) return;

        try {
            const { StatusBar } = await import('@capacitor/status-bar');
            await StatusBar.hide();
            Debug.info('mobile', 'Status bar hidden');
        } catch (err) {
            Debug.debug('mobile', 'StatusBar plugin not available');
        }
    }

    /**
     * Pokaż status bar (w menu).
     */
    static async showStatusBar() {
        if (!MobileUtils._isCapacitor) return;

        try {
            const { StatusBar } = await import('@capacitor/status-bar');
            await StatusBar.show();
        } catch (err) {
            Debug.debug('mobile', 'StatusBar plugin not available');
        }
    }

    /**
     * Wibracja (haptic feedback).
     *
     * @param {string} [style='Medium'] - 'Light' | 'Medium' | 'Heavy'
     */
    static async haptic(style = 'Medium') {
        if (!MobileUtils._isCapacitor) return;

        try {
            const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
            await Haptics.impact({ style: ImpactStyle[style] || ImpactStyle.Medium });
        } catch (err) {
            Debug.debug('mobile', 'Haptics plugin not available');
        }
    }

    /**
     * Pobierz profil wydajności dla platformy.
     *
     * Mobile automatycznie ustawia niższą jakość.
     *
     * @param {string} platform - 'desktop' | 'mobile' | 'tablet'
     * @returns {{ graphicsQuality: string, viewDistance: number, maxDecorations: number, antialias: boolean, pixelRatio: number }}
     */
    static getPerformanceProfile(platform) {
        switch (platform) {
            case 'mobile':
                return {
                    graphicsQuality: 'low',
                    viewDistance: 3,
                    maxDecorations: 5,
                    antialias: false,
                    pixelRatio: 1,
                };
            case 'tablet':
                return {
                    graphicsQuality: 'medium',
                    viewDistance: 4,
                    maxDecorations: 10,
                    antialias: false,
                    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                };
            default:
                return {
                    graphicsQuality: 'high',
                    viewDistance: 5,
                    maxDecorations: 15,
                    antialias: true,
                    pixelRatio: Math.min(window.devicePixelRatio, 2),
                };
        }
    }

    /**
     * Czy aplikacja działa w Capacitor.
     *
     * @returns {boolean}
     */
    static get isCapacitor() {
        return MobileUtils._isCapacitor;
    }
}

export default MobileUtils;
