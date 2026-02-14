# Otwarty świat (Chunk System) — zasady

- Chunk = kwadrat CHUNK_SIZE x CHUNK_SIZE jednostek
- Generowanie deterministyczne z seed — ten sam seed = ten sam chunk
- Object pooling: recykluj mesh przez chunk-pool.js
- LOD: 3 poziomy detali wg odległości od gracza
- Nie ładuj chunków synchronicznie — używaj requestIdleCallback lub setTimeout
- Stałe w world-config.js — nigdy hardcode
