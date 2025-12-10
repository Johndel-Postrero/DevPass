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
        if (!Schema::hasTable('gates')) {
            Schema::create('gates', function (Blueprint $table) {
                $table->id('gate_id');
                $table->string('gate_name', 50);
                $table->string('location', 100);
                $table->boolean('is_active')->default(true); // Per database diagram
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gates');
    }
};
