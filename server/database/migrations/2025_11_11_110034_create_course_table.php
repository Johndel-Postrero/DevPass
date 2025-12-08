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
            Schema::create('course', function (Blueprint $table) {
            $table->string('course_id')->primary();
            $table->string('course_name');
            $table->string('course_code');
            $table->string('description');
            $table->timestamps();

            // $table->string('department_id');
            // $table->foreign('department_id')->references('department_id')->on('department')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course');
    }
};
