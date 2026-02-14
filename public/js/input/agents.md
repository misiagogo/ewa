# Sterowanie (multi-platform) — zasady

- input-adapter.js: auto-detect urządzenia, zwraca ujednolicony obiekt inputu
- keyboard-handler.js: strzałki + WASD, desktop
- touch-handler.js: nipplejs virtual joystick, mobile
- Ujednolicony format: { forward, backward, left, right, rotY }
- Nie sprawdzaj platformy poza input-adapter.js
- input-config.js: mapowanie klawiszy/gestów — konfigurowalne
