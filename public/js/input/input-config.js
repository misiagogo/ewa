/**
 * InputConfig — mapowanie klawiszy i gestów.
 *
 * Konfigurowalne — gracz może zmienić przypisania.
 * Nie sprawdzaj platformy poza input-adapter.js.
 */

const InputConfig = {
    /** Mapowanie klawiszy → akcji (desktop) */
    keyboard: {
        forward: ['KeyW', 'ArrowUp'],
        backward: ['KeyS', 'ArrowDown'],
        left: ['KeyA'],
        right: ['KeyD'],
        rotateLeft: ['KeyQ', 'ArrowLeft'],
        rotateRight: ['KeyE', 'ArrowRight'],
        jump: ['Space'],
        interact: ['KeyF'],
        menu: ['Escape'],
        chat: ['Enter'],
    },

    /** Konfiguracja joysticka (mobile) */
    touch: {
        /** Strefa lewego joysticka (ruch) — procent szerokości ekranu */
        moveZone: { left: 0, top: 50, width: 50, height: 50 },
        /** Strefa prawego joysticka (kamera) — procent szerokości ekranu */
        cameraZone: { left: 50, top: 50, width: 50, height: 50 },
        /** Czułość joysticka (0-1) */
        sensitivity: 0.8,
        /** Martwa strefa joysticka (0-1) */
        deadzone: 0.15,
    },

    /** Prędkości */
    moveSpeed: 8,
    rotSpeed: 2,
};

export default InputConfig;
