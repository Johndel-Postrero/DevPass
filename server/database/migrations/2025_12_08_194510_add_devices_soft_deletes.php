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
        // NOTE: Soft deletes are now included in the original create_laptop_table_erd.php migration
        // This migration is kept for backward compatibility with existing databases
        if (Schema::hasTable('devices')) {
            Schema::table('devices', function (Blueprint $table) {
                if (!Schema::hasColumn('devices', 'deleted_at')) {
                    $table->softDeletes()->after('updated_at');
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
                if (Schema::hasColumn('devices', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
            });
        }
    }
};
