<?php

use Illuminate\Support\Facades\Route;

// Główny widok gry — cała logika w JS (SPA)
Route::get('/{any?}', function () {
    return view('game');
})->where('any', '.*');
