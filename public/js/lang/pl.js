/**
 * Tłumaczenia — język polski.
 */

import { registerTranslations } from './lang.js';

registerTranslations('pl', {
    // Ekran logowania/rejestracji
    'screen.login.title': 'Logowanie',
    'screen.login.email': 'Adres e-mail',
    'screen.login.password': 'Hasło',
    'screen.login.submit': 'Zaloguj się',
    'screen.login.register_link': 'Nie masz konta? Zarejestruj się',
    'screen.register.title': 'Rejestracja',
    'screen.register.name': 'Nazwa użytkownika',
    'screen.register.email': 'Adres e-mail',
    'screen.register.password': 'Hasło',
    'screen.register.password_confirm': 'Potwierdź hasło',
    'screen.register.submit': 'Zarejestruj się',
    'screen.register.login_link': 'Masz już konto? Zaloguj się',

    // Ekran powitalny
    'screen.welcome.title': 'Cat Survival',
    'screen.welcome.subtitle': 'Przetrwaj jako kot w otwartym świecie',
    'screen.welcome.singleplayer': 'Gra jednoosobowa',
    'screen.welcome.multiplayer': 'Multiplayer',
    'screen.welcome.settings': 'Ustawienia',
    'screen.welcome.logout': 'Wyloguj się',

    // Lobby multiplayer
    'screen.lobby.title': 'Pokoje multiplayer',
    'screen.lobby.create': 'Utwórz pokój',
    'screen.lobby.join': 'Dołącz',
    'screen.lobby.players': ':count/:max graczy',
    'screen.lobby.status.waiting': 'Oczekuje',
    'screen.lobby.status.playing': 'W grze',
    'screen.lobby.back': 'Powrót',
    'screen.lobby.room_name': 'Nazwa pokoju',
    'screen.lobby.password': 'Hasło (opcjonalne)',
    'screen.lobby.public': 'Publiczny',

    // Wybór terytorium
    'screen.territory.title': 'Wybierz terytorium',
    'screen.territory.pine_forest': 'Las iglasty',
    'screen.territory.deciduous_forest': 'Las liściasty',
    'screen.territory.desert': 'Pustynia',
    'screen.territory.mountains': 'Góry',
    'screen.territory.swamp': 'Bagna',
    'screen.territory.select': 'Wybierz',

    // Kreator kota
    'screen.creator.title': 'Stwórz swojego kota',
    'screen.creator.name': 'Imię kota',
    'screen.creator.fur_color': 'Kolor futra',
    'screen.creator.pattern': 'Wzór',
    'screen.creator.pattern.solid': 'Jednolity',
    'screen.creator.pattern.striped': 'Pręgowany',
    'screen.creator.pattern.spotted': 'Cętkowany',
    'screen.creator.pattern.speckled': 'Nakrapiany',
    'screen.creator.pattern.patched': 'Łaciaty',
    'screen.creator.pattern.bicolor': 'Dwukolorowy',
    'screen.creator.eye_color': 'Kolor oczu',
    'screen.creator.weight': 'Waga',
    'screen.creator.age': 'Wiek',
    'screen.creator.age.young': 'Młody',
    'screen.creator.age.adult': 'Dorosły',
    'screen.creator.age.senior': 'Senior',
    'screen.creator.gender': 'Płeć',
    'screen.creator.gender.male': 'Kocur',
    'screen.creator.gender.female': 'Kotka',
    'screen.creator.start': 'Rozpocznij grę',
    'screen.creator.back': 'Powrót',

    // Ekran gry
    'screen.game.chat_placeholder': 'Napisz wiadomość...',
    'screen.game.menu': 'Menu',
    'screen.game.save': 'Zapisz',

    // Ustawienia
    'screen.settings.title': 'Ustawienia',
    'screen.settings.language': 'Język',
    'screen.settings.graphics': 'Jakość grafiki',
    'screen.settings.graphics.low': 'Niska',
    'screen.settings.graphics.medium': 'Średnia',
    'screen.settings.graphics.high': 'Wysoka',
    'screen.settings.view_distance': 'Zasięg widoczności',
    'screen.settings.sound': 'Głośność',
    'screen.settings.autosave': 'Autozapis',
    'screen.settings.save': 'Zapisz ustawienia',
    'screen.settings.back': 'Powrót',

    // Ogólne
    'button.ok': 'OK',
    'button.cancel': 'Anuluj',
    'button.back': 'Powrót',
    'error.network': 'Błąd połączenia z serwerem',
    'error.save_failed': 'Nie udało się zapisać gry',
    'error.login_failed': 'Nieprawidłowe dane logowania',
    'error.register_failed': 'Rejestracja nie powiodła się',
    'success.saved': 'Gra zapisana',
    'success.settings_saved': 'Ustawienia zapisane',
});
