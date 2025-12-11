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
        // Only create if entry_log table doesn't exist
        if (!Schema::hasTable('entry_log')) {
            Schema::create('entry_log', function (Blueprint $table) {
                $table->id('log_id');
                $table->unsignedBigInteger('qr_id'); // Use PK for proper normalization
                $table->string('qr_code_hash', 255); // Per database diagram: not null (for reference)
                $table->unsignedBigInteger('gate_id');
                $table->string('security_guard_id', 20);
                $table->timestamp('scan_timestamp')->useCurrent(); // Per database diagram: default now()
                $table->string('status', 20)->default('success');
                $table->timestamps();
                
                // Foreign keys
                $table->foreign('qr_id')->references('qr_id')->on('qr_codes')->onDelete('cascade');
                $table->foreign('gate_id')->references('gate_id')->on('gates')->onDelete('cascade');
                $table->foreign('security_guard_id')->references('guard_id')->on('security_guards')->onDelete('cascade');
                
                // Per database diagram: indexes on qr_code_hash, gate_id, security_guard_id, scan_timestamp
                $table->index('qr_code_hash');
                $table->index('gate_id');
                $table->index('security_guard_id');
                $table->index('scan_timestamp');
                $table->index('status'); // Additional index for filtering
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_log');
    }
};
