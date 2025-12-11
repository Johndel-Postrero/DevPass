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
        // Only create if devices table doesn't exist
        if (!Schema::hasTable('devices')) {
            Schema::create('devices', function (Blueprint $table) {
                $table->id('laptop_id');
                $table->string('student_id', 20);
                $table->string('model', 100); // Per database diagram: string (NOT unique - multiple devices can share same model)
                $table->string('serial_number', 100)->nullable(); // Unique constraint added in separate migration
                $table->string('brand', 50); // Per database diagram: varchar(50) not null
                $table->timestamp('registration_date')->useCurrent(); // Per database diagram: default now()
                $table->string('registration_status', 20)->default('pending');
                $table->unsignedBigInteger('approved_by')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamps();
                
                $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
                $table->foreign('approved_by')->references('admin_id')->on('admins')->onDelete('set null');
                
                // Foreign key: model references laptop_specifications.model (per database diagram)
                // This allows auto-filling specifications when model is detected
                // Note: FK will be added after laptop_specifications table is created
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
