# Backend Laravel — zasady

## Kontrolery
- Jeden kontroler = jedna funkcja biznesowa
- Nie umieszczaj logiki biznesowej w kontrolerze — deleguj do Service
- Walidacja tylko przez Form Requests
- Odpowiedzi przez Resources/Transformers
- Teksty przez `__()` — nigdy plain text

## Modele
- Relacje zdefiniowane w modelu
- Fillable/guarded jawnie zadeklarowane
- Casty na JSON kolumny
- Scopes dla częstych zapytań

## Services
- Logika biznesowa w Services, nie w kontrolerach
- Jeden Service per obszar (GameSaveService, GameRoomService)
- Wstrzykiwanie przez constructor injection

## Events / Broadcasting
- Eventy dla akcji multiplayer (PlayerMoved, PlayerJoined)
- Broadcasting przez Reverb channels
- Autoryzacja kanałów w channels.php

## Migracje
- Wersjonowanie schematu — nigdy nie edytuj istniejącej migracji
- Nowa zmiana = nowa migracja

## Testy
- Feature testy dla każdego endpointu
- Mockowanie zewnętrznych serwisów
