# Ekrany UI — zasady

- Jeden ekran = jedna klasa z enter(), exit(), update()
- Ekran zarządza swoim HTML (Bootstrap) — tworzy/usuwa DOM
- ZAKAZ inline CSS — tylko klasy Bootstrap lub globalne z game.css
- Teksty przez __() z lang.js
- Ekran komunikuje się z resztą przez EventBus — nigdy bezpośrednio
- Formularz walidowany na froncie PRZED wysłaniem do API
