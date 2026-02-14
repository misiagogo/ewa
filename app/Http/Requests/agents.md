# Form Requests — zasady

- Jeden Request per akcja (SaveGameRequest, CreateRoomRequest)
- `authorize()` — sprawdzaj uprawnienia
- `rules()` — walidacja pól
- `messages()` — komunikaty przez `__()` ze słownika
