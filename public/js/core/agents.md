# Core — rdzeń silnika gry

- ECS (ecs.js): World, Entity, Component, System — nie modyfikuj interfejsów bez aktualizacji wszystkich systemów
- EventBus (event-bus.js): emit/on/off — nazwy eventów w formacie 'category:action'
- StateMachine (state-machine.js): jeden stan aktywny, enter/exit/update
- GameLoop (game-loop.js): requestAnimationFrame, delta time w sekundach
- ApiClient (api-client.js): wszystkie requesty REST przez tę klasę, auto-token Sanctum
- WsClient (ws-client.js): wszystkie WebSocket przez tę klasę, auto-reconnect
- Debug (debug.js): jedyny sposób logowania — nigdy console.log bezpośrednio
