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
        if (!Schema::hasTable('security_guards')) {
            Schema::create('security_guards', function (Blueprint $table) {
                $table->string('guard_id', 20)->primary();
                $table->string('name', 100);
                $table->string('email', 150)->unique(); // Per database diagram: varchar(150) not null unique
                $table->string('phone', 15)->nullable();
                $table->string('password', 255); // Per database diagram: varchar(255) not null
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_guards');
    }
};
