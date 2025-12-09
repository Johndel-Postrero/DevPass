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
        // NOTE: These columns are now included in the original create_laptop_table_erd.php migration
        // This migration is kept for backward compatibility with existing databases
        if (Schema::hasTable('devices')) {
            Schema::table('devices', function (Blueprint $table) {
                if (!Schema::hasColumn('devices', 'original_values')) {
                    $table->json('original_values')->nullable()->after('approved_at');
                }
                if (!Schema::hasColumn('devices', 'last_action')) {
                    $table->string('last_action', 20)->nullable()->after('original_values'); // 'approved', 'rejected', 'reverted'
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('devices')) {
            Schema::table('devices', function (Blueprint $table) {
                if (Schema::hasColumn('devices', 'original_values')) {
                    $table->dropColumn('original_values');
                }
                if (Schema::hasColumn('devices', 'last_action')) {
                    $table->dropColumn('last_action');
                }
            });
        }
    }
};
