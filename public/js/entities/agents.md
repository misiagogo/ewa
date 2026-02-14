# Fabryki encji — zasady

- Fabryka = funkcja tworząca encję z zestawem komponentów
- Nie przechowuj stanu w fabryce
- Zwracaj entity ID
- Nazewnictwo: createCatEntity(world, config) → entityId
- Fabryka odpowiada za dodanie WSZYSTKICH wymaganych komponentów
