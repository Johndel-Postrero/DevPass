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
        // NOTE: This migration is kept for backward compatibility with existing databases
        // Extra fields (device_type, model_number, mac_address) are NOT in the database diagram
        // and should not be added to new installations
        // This migration now does nothing for new installations to match the diagram
        if (Schema::hasTable('devices')) {
            // Only add columns if they don't exist (for existing databases)
            // New installations should not have these fields
            // Commented out to match database diagram
            /*
            Schema::table('devices', function (Blueprint $table) {
                if (!Schema::hasColumn('devices', 'device_type')) {
                    $table->string('device_type', 50)->nullable()->after('student_id');
                }
                if (!Schema::hasColumn('devices', 'model_number')) {
                    $table->string('model_number', 100)->nullable()->after('model');
                }
                if (!Schema::hasColumn('devices', 'mac_address')) {
                    $table->string('mac_address', 17)->nullable()->after('serial_number');
                }
            });
            */
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('devices')) {
            Schema::table('devices', function (Blueprint $table) {
                if (Schema::hasColumn('devices', 'device_type')) {
                    $table->dropColumn('device_type');
                }
                if (Schema::hasColumn('devices', 'model_number')) {
                    $table->dropColumn('model_number');
                }
                if (Schema::hasColumn('devices', 'mac_address')) {
                    $table->dropColumn('mac_address');
                }
            });
        }
    }
};
