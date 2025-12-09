<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // NOTE: qr_id FK is now included in the original create_device_entries_table.php migration
        // This migration is kept for backward compatibility with existing databases that used qr_code_hash
        if (Schema::hasTable('entry_log')) {
            // Check if qr_id column already exists (from merged migration)
            if (!Schema::hasColumn('entry_log', 'qr_id')) {
                // Drop the old foreign key constraint if it exists
                try {
                    Schema::table('entry_log', function (Blueprint $table) {
                        $table->dropForeign(['qr_code_hash']);
                    });
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
                
                // Add new qr_id column
                Schema::table('entry_log', function (Blueprint $table) {
                    $table->unsignedBigInteger('qr_id')->nullable()->after('log_id');
                });
                
                // Migrate data: get qr_id from qr_codes table based on qr_code_hash
                if (Schema::hasColumn('entry_log', 'qr_code_hash')) {
                    DB::statement('
                        UPDATE entry_log el
                        INNER JOIN qr_codes qr ON el.qr_code_hash = qr.qr_code_hash
                        SET el.qr_id = qr.qr_id
                    ');
                }
                
                // Make qr_id NOT NULL after data migration
                Schema::table('entry_log', function (Blueprint $table) {
                    $table->unsignedBigInteger('qr_id')->nullable(false)->change();
                });
                
                // Add foreign key constraint to qr_id
                Schema::table('entry_log', function (Blueprint $table) {
                    $table->foreign('qr_id')->references('qr_id')->on('qr_codes')->onDelete('cascade');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('entry_log')) {
            Schema::table('entry_log', function (Blueprint $table) {
                try {
                    $table->dropForeign(['qr_id']);
                } catch (\Exception $e) {
                    // Continue if FK doesn't exist
                }
                if (Schema::hasColumn('entry_log', 'qr_id')) {
                    $table->dropColumn('qr_id');
                }
                
                // Restore old foreign key if needed
                // $table->foreign('qr_code_hash')->references('qr_code_hash')->on('qr_codes')->onDelete('cascade');
            });
        }
    }
};
