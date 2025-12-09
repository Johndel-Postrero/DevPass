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
                $table->unsignedBigInteger('laptop_id'); // Fixed: Reference PK instead of non-unique model
                $table->string('model')->nullable(); // Keep for reference, but not used as FK
                $table->string('processor', 100);
                $table->string('motherboard', 100);
                $table->string('memory', 50);
                $table->string('harddrive', 100);
                $table->string('monitor', 100);
                $table->string('casing', 100);
                $table->string('cd_dvd_rom', 50);
                $table->string('operating_system', 100);
                $table->timestamps();

                // Fixed: Reference primary key (laptop_id) instead of non-unique model column
                $table->foreign('laptop_id')->references('laptop_id')->on('devices')->onDelete('cascade');
                $table->unique('laptop_id'); // One specification per device (one-to-one relationship)
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