import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Konfiguracja Capacitor — opakowanie gry w natywny WebView.
 *
 * webDir: public/ — Laravel serwuje pliki statyczne z tego katalogu.
 * server.url: w trybie dev wskazuje na serwer Laravel.
 */
const config: CapacitorConfig = {
    appId: 'com.catsurvival.game',
    appName: 'Cat Survival',
    webDir: 'public',
    server: {
        // W trybie dev — odkomentuj i ustaw IP serwera Laravel:
        // url: 'http://192.168.1.100:8000',
        // cleartext: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#1a1a2e',
            showSpinner: true,
            spinnerColor: '#e94560',
        },
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#1a1a2e',
        },
    },
    android: {
        allowMixedContent: true,
    },
    ios: {
        contentInset: 'always',
    },
};

export default config;
