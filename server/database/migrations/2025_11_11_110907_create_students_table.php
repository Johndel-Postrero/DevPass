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
        if (!Schema::hasTable('students')) {
            Schema::create('students', function (Blueprint $table) {
                $table->string('student_id', 20)->primary(); // Student ID (e.g., STU001) - per database diagram
                $table->string('name', 100);
                $table->string('email', 150)->unique();
                $table->string('phone', 15)->nullable();
                $table->integer('course_id'); // Changed to integer per database diagram
                $table->integer('year_of_study')->nullable();
                $table->string('password', 255); // Encrypted password
                $table->timestamps(); // created_at and updated_at

                $table->foreign('course_id')->references('course_id')->on('course')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
