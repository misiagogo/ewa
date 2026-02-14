# Frontend JS — zasady globalne

- ES6 Modules (import/export) — nigdy script tags z globalnym scope
- Jeden plik = jeden moduł/klasa
- ZAKAZ JS w widokach HTML — tylko zewnętrzne pliki
- Teksty przez __() z lang.js — nigdy plain text w JS
- Debug przez klasę Debug (js/core/debug.js)
- Nie używaj jQuery, Vite, bundlerów
- Three.js importowany jako ES module
