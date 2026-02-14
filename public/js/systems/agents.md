# Systemy ECS — zasady

- System = TYLKO logika, ZERO danych własnych
- Każdy system: klasa z update(dt, world)
- Query: system deklaruje wymagane komponenty (np. [Transform, Velocity])
- Kolejność systemów ma znaczenie — InputSystem przed MovementSystem
- Nie modyfikuj komponentów innych niż zadeklarowane w query
- Systemy sieciowe (network, interpolation, prediction) działają tylko w multiplayer
