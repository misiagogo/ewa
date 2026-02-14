# Sieć (multiplayer) — zasady

- Cała komunikacja przez ws-client.js (Echo/Reverb)
- Input buffer: buforuj inputy z numerem sekwencji
- State buffer: buforuj stany serwera do interpolacji
- Prediction: aplikuj input lokalnie natychmiast, koryguj po odpowiedzi serwera
- Interpolation: zdalni gracze renderowani z opóźnieniem 2 ticków
- Nigdy nie ufaj danym od klienta — serwer jest autorytatywny
- Chat: sanityzuj wiadomości przed wyświetleniem
