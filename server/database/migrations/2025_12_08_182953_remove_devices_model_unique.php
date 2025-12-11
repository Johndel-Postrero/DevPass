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
        // Remove unique constraint from devices.model (multiple devices can share same model)
        // The FK will be from devices.model to laptop_specifications.model (which is unique)
        if (Schema::hasTable('devices')) {
            try {
                $indexes = DB::select("SHOW INDEX FROM devices WHERE Column_name = 'model' AND Non_unique = 0");
                foreach ($indexes as $index) {
                    try {
                        DB::statement("ALTER TABLE devices DROP INDEX `{$index->Key_name}`");
                    } catch (\Exception $e) {
                        // Continue
                    }
                }
            } catch (\Exception $e) {
                // Continue if errors
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('devices')) {
            // Remove unique constraint (reverse of up)
            try {
                DB::statement("ALTER TABLE devices DROP INDEX devices_model_unique");
            } catch (\Exception $e) {
                // Continue if doesn't exist
            }
        }
    }
};
