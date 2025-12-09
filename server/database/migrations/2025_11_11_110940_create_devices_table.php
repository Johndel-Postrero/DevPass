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
                $table->string('device_type', 50)->nullable(); // Added per data dictionary
                $table->string('model', 100); // Removed unique constraint (handled by separate migration)
                $table->string('model_number', 100)->nullable(); // Added per data dictionary
                $table->string('serial_number', 100)->nullable();
                $table->string('mac_address', 17)->nullable(); // Added per data dictionary
                $table->string('brand', 50)->nullable();
                $table->timestamp('registration_date')->nullable();
                $table->string('registration_status', 20)->default('pending');
                $table->unsignedBigInteger('approved_by')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->json('original_values')->nullable(); // For rejection rollback
                $table->string('last_action', 20)->nullable(); // Track last action: 'approved', 'rejected', 'reverted'
                $table->timestamps();
                $table->softDeletes(); // Soft delete support
                
                $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
                $table->foreign('approved_by')->references('admin_id')->on('admins')->onDelete('set null');
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
