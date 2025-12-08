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
                $table->string('id')->primary(); // Student ID (e.g., STU001) - must be unique and indexed for foreign key
                $table->string('name');
                $table->string('email')->unique();
                $table->string('phone')->nullable();
                // $table->string('department_id');
                $table->string('course_id');
                $table->integer('year_of_study')->nullable();
                $table->string('password'); // Encrypted password
                $table->timestamps(); // created_at and updated_at

            // $table->foreign('department_id')->references('department_id')->on('department')->onDelete('cascade');
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
