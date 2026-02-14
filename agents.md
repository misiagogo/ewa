# Cat Survival — Globalne zasady budowy aplikacji

## Język i tłumaczenia
- ZAKAZ plain tekstu w kontrolerach, widokach, modelach, JS — zawsze `__()` ze słownika
- Słownik obsługuje przełączanie języków — nigdy nie sprawdzaj ręcznie `pl`/`en`

## Styl kodu
- Jeden plik = jeden moduł/klasa/obszar funkcjonalny
- ZAKAZ JS w widokach Blade — tylko zewnętrzne pliki `.js`
- ZAKAZ inline CSS — tylko klasy Bootstrap lub globalne klasy z `game.css`
- Nie mieszaj styli z szablonami — w szablonach tylko klasy CSS
- Nie używaj Vite

## Architektura
- Każda funkcja biznesowa w oddzielnych kontrolerach, modelach, widokach
- Używaj kodu wspólnego (formularze, komponenty, widoki) tam gdzie się da
- Wykorzystuj możliwości frameworka zanim napiszesz własną funkcję
- Klucze API, tokeny — tylko w `.env`, nigdy hardcode
- Nic nie rób hardcode — stałe w config, teksty w słowniku

## Debugowanie
- Globalna flaga `APP_DEBUG` przełącza debug/production
- Klasa `Debug` (PHP) i `Debug` (JS) — zawsze przez nią
- W trybie debug: dumpuj dane w osobnym boksie, dołączaj do widoku
- Wszystkie błędy muszą być opisane (message + context)

## Bezpieczeństwo
- Walidacja przez Form Requests (Laravel) — nigdy w kontrolerze
- Sanctum tokeny — nigdy w localStorage bez httpOnly
- Sanityzacja inputu na froncie i backendzie

## Dokumentacja
- Opisuj wszystkie dodawane funkcje, klasy, metody (PHPDoc / JSDoc)
- Komentarze do nowych routes, klas, zmiennych wymagających wyjaśnienia
- Przed wywołaniem metody — sprawdź czy istnieje

## Testy
- Testy jednostkowe dla każdej nowej funkcjonalności
- Nie usuwaj istniejących testów bez polecenia

## Naprawianie błędów
- Naprawiaj tylko wskazane miejsce — nie dopisuj nic nowego
- Skup się na elementarnym pojedynczym kroku do naprawy
- Nigdy nie zamieniaj technologii samodzielnie (np. MySQL→SQLite)
