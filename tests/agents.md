# Testy — zasady

- Feature testy (PHP): jeden test per endpoint, happy path + edge cases
- Unit testy (JS): jeden test per system/moduł
- Nie usuwaj istniejących testów bez polecenia
- Mockuj zewnętrzne serwisy (API, WebSocket)
- Nazewnictwo: [Moduł]Test.php, [moduł].test.js
- Asercje: sprawdzaj status code, strukturę JSON, side effects
