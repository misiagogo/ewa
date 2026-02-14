# Kontrolery — zasady

- Jeden kontroler per zasób (GameSaveController, GameRoomController)
- Metody: index, show, store, update, destroy (RESTful)
- Walidacja przez Form Request — nigdy inline
- Return: Resource lub JsonResponse
- Teksty: `__('messages.save_created')` — nigdy string
- Auth: middleware `auth:sanctum` na routach
- Nie umieszczaj logiki biznesowej — deleguj do Service
