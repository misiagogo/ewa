<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->foreignId('host_user_id')->constrained('users')->onDelete('cascade');
            $table->string('territory', 50);
            $table->bigInteger('world_seed');
            $table->tinyInteger('max_players')->unsigned()->default(10);
            $table->enum('status', ['waiting', 'playing', 'closed'])->default('waiting');
            $table->boolean('is_public')->default(true);
            $table->string('password')->nullable()->comment('Hash for private rooms');
            $table->timestamps();

            $table->index('status');
            $table->index('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_rooms');
    }
};
