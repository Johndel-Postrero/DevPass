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
        Schema::create('laptop_specifications', function (Blueprint $table) {
            $table->id('spec_id');
            $table->string('model');
            $table->string('processor', 100);
            $table->string('motherboard', 100);
            $table->string('memory', 50);
            $table->string('harddrive', 100);
            $table->string('monitor', 100);
            $table->string('casing', 100);
            $table->string('cd_dvd_rom', 50);
            $table->string('operating_system', 100);
            $table->timestamps();

            $table->foreign('model')->references('model')->on('devices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laptop_specifications');
    }
};