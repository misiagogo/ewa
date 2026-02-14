# Generatory proceduralne — zasady

- Generowanie deterministyczne — seed-based, powtarzalne wyniki
- cat-model-generator: proceduralny model z Three.js geometrii
- terrain-generator: heightmap per chunk z Perlin Noise
- decoration-generator: drzewa/skały/kaktusy per chunk per biom
- Nie twórz nowych materiałów per obiekt — cache'uj i reużywaj
- Parametry generacji w world-config.js i biom definitions
