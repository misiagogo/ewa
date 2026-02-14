# Broadcasting Events — zasady

- Jeden Event per akcja multiplayer
- Implementuj ShouldBroadcast
- broadcastOn() → kanał Reverb
- broadcastWith() → minimalne dane (tylko ID + delta)
- Nie wysyłaj wrażliwych danych przez broadcast
