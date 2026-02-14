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
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('language', 5)->default('pl');
            $table->enum('graphics_quality', ['low', 'medium', 'high'])->default('medium');
            $table->tinyInteger('view_distance')->unsigned()->default(5)->comment('Chunks radius');
            $table->tinyInteger('sound_volume')->unsigned()->default(80)->comment('0-100');
            $table->boolean('autosave_enabled')->default(true);
            $table->unsignedInteger('autosave_interval')->default(60)->comment('Seconds');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
