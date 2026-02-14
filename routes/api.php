<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\GameLogController;
use App\Http\Controllers\GameRoomController;
use App\Http\Controllers\GameSaveController;
use App\Http\Controllers\UserSettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes — rejestracja, logowanie, wylogowanie
|--------------------------------------------------------------------------
*/
Route::post('/register', RegisterController::class)->name('api.auth.register');
Route::post('/login', LoginController::class)->name('api.auth.login');

Route::middleware('auth:sanctum')->group(function () {

    // Wylogowanie — usunięcie aktualnego tokenu
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => __('auth.logged_out')]);
    })->name('api.auth.logout');

    // Dane zalogowanego użytkownika
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'last_login_at' => $request->user()->last_login_at,
            ],
        ]);
    })->name('api.auth.user');

    /*
    |--------------------------------------------------------------------------
    | Game Saves — CRUD + autosave
    |--------------------------------------------------------------------------
    */
    Route::get('/saves', [GameSaveController::class, 'index'])->name('api.saves.index');
    Route::post('/saves', [GameSaveController::class, 'store'])->name('api.saves.store');
    Route::post('/saves/autosave', [GameSaveController::class, 'autosave'])->name('api.saves.autosave');
    Route::get('/saves/{id}', [GameSaveController::class, 'show'])->name('api.saves.show');
    Route::put('/saves/{id}', [GameSaveController::class, 'update'])->name('api.saves.update');
    Route::delete('/saves/{id}', [GameSaveController::class, 'destroy'])->name('api.saves.destroy');

    /*
    |--------------------------------------------------------------------------
    | User Settings — get + update
    |--------------------------------------------------------------------------
    */
    Route::get('/settings', [UserSettingsController::class, 'show'])->name('api.settings.show');
    Route::put('/settings', [UserSettingsController::class, 'update'])->name('api.settings.update');

    /*
    |--------------------------------------------------------------------------
    | Game Logs — store (single or batch)
    |--------------------------------------------------------------------------
    */
    Route::post('/logs', [GameLogController::class, 'store'])->name('api.logs.store');

    /*
    |--------------------------------------------------------------------------
    | Game Rooms — multiplayer lobby
    |--------------------------------------------------------------------------
    */
    Route::get('/rooms', [GameRoomController::class, 'index'])->name('api.rooms.index');
    Route::post('/rooms', [GameRoomController::class, 'store'])->name('api.rooms.store');
    Route::get('/rooms/{id}', [GameRoomController::class, 'show'])->name('api.rooms.show');
    Route::post('/rooms/{id}/join', [GameRoomController::class, 'join'])->name('api.rooms.join');
    Route::post('/rooms/{id}/leave', [GameRoomController::class, 'leave'])->name('api.rooms.leave');
    Route::delete('/rooms/{id}', [GameRoomController::class, 'destroy'])->name('api.rooms.destroy');

});
