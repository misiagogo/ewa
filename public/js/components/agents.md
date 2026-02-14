# Komponenty ECS — zasady

- Komponent = TYLKO dane (properties), ZERO logiki
- Każdy komponent to klasa z constructor ustawiającym defaults
- Nazwa klasy = PascalCase (Transform, Velocity, CatConfig)
- Eksportuj klasę jako default
- Komponent musi mieć metodę serialize() i static deserialize()
- Nie importuj Three.js w komponentach — to dane, nie rendering
  (wyjątek: Renderable przechowuje referencję do mesh)
