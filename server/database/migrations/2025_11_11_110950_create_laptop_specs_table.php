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
        if (!Schema::hasTable('laptop_specifications')) {
            Schema::create('laptop_specifications', function (Blueprint $table) {
                $table->id('spec_id');
                $table->string('model', 100)->unique(); // Unique model per specification - referenced by devices.model
                $table->string('processor', 100)->nullable();
                $table->string('motherboard', 100)->nullable();
                $table->string('memory', 50)->nullable();
                $table->string('harddrive', 100)->nullable();
                $table->string('monitor', 100)->nullable();
                $table->string('casing', 100)->nullable();
                $table->string('cd_dvd_rom', 50)->nullable();
                $table->string('operating_system', 100)->nullable();
                $table->timestamps();

                // Note: devices.model will reference this model (FK in devices table, not here)
                // This allows multiple devices to share the same model and auto-fill specifications
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laptop_specifications');
    }
};