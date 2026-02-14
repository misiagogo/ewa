# Narzędzia — zasady

- save-manager.js: serializacja stanu → ApiClient, deserializacja → ECS World
- noise.js: Perlin Noise z seed — czysta funkcja, zero side effects
- math-utils.js: lerp, clamp, randomRange — czyste funkcje
- Nie dodawaj zależności od ECS/Three.js w utils — to warstwa niezależna
