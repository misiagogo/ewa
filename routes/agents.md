# Routes — zasady

- api.php: tylko REST API, prefix /api
- channels.php: autoryzacja kanałów WebSocket
- Grupuj routy: auth, saves, settings, rooms, logs
- Middleware: auth:sanctum na chronionych endpointach
- Nazwy routów: api.saves.index, api.rooms.join
- Komentarz nad każdą grupą routów
