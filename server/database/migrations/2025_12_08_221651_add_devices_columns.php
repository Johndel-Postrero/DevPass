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
        // NOTE: These columns are now included in the original create_laptop_table_erd.php migration
        // This migration is kept for backward compatibility with existing databases
        if (Schema::hasTable('devices')) {
            Schema::table('devices', function (Blueprint $table) {
                // Add device_type column (per data dictionary)
                if (!Schema::hasColumn('devices', 'device_type')) {
                    $table->string('device_type', 50)->nullable()->after('student_id');
                }
                
                // Add model_number column (per data dictionary)
                if (!Schema::hasColumn('devices', 'model_number')) {
                    $table->string('model_number', 100)->nullable()->after('model');
                }
                
                // Add mac_address column (per data dictionary - should be in devices, not laptop_specifications)
                if (!Schema::hasColumn('devices', 'mac_address')) {
                    $table->string('mac_address', 17)->nullable()->after('serial_number');
                }
            });
            
            // Migrate mac_address data from laptop_specifications to devices if it exists there
            if (Schema::hasTable('laptop_specifications') && Schema::hasColumn('laptop_specifications', 'mac_address')) {
                DB::statement('
                    UPDATE devices d
                    INNER JOIN laptop_specifications ls ON d.model = ls.model
                    SET d.mac_address = ls.mac_address
                    WHERE ls.mac_address IS NOT NULL AND d.mac_address IS NULL
                ');
            }
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
