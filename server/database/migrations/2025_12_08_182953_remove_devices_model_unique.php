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
        if (Schema::hasTable('devices')) {
            // First, drop the foreign key from laptop_specifications if it exists
            // Then we can safely remove the unique constraint on model
            if (Schema::hasTable('laptop_specifications')) {
                try {
                    // Get all foreign keys that reference devices.model
                    $foreignKeys = DB::select("
                        SELECT CONSTRAINT_NAME 
                        FROM information_schema.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'laptop_specifications' 
                        AND COLUMN_NAME = 'model'
                        AND REFERENCED_TABLE_NAME = 'devices'
                        AND REFERENCED_COLUMN_NAME = 'model'
                    ");
                    
                    foreach ($foreignKeys as $fk) {
                        try {
                            $constraintName = $fk->CONSTRAINT_NAME;
                            DB::statement("ALTER TABLE laptop_specifications DROP FOREIGN KEY `{$constraintName}`");
                        } catch (\Exception $e) {
                            // Continue if this foreign key doesn't exist
                        }
                    }
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
            }
            
            // Now drop the unique index on model column
            // Try multiple approaches to ensure it's removed
            try {
                $indexes = DB::select("SHOW INDEX FROM devices WHERE Column_name = 'model' AND Non_unique = 0");
                
                foreach ($indexes as $index) {
                    try {
                        $indexName = $index->Key_name;
                        DB::statement("ALTER TABLE devices DROP INDEX `{$indexName}`");
                    } catch (\Exception $e) {
                        // Try alternative method
                        try {
                            DB::statement("DROP INDEX `{$indexName}` ON devices");
                        } catch (\Exception $e2) {
                            // Index might not exist, continue
                        }
                    }
                }
            } catch (\Exception $e) {
                // If SHOW INDEX fails, try dropping common index names
                $commonNames = ['devices_model_unique', 'devices_model_unique_index', 'model'];
                foreach ($commonNames as $name) {
                    try {
                        DB::statement("ALTER TABLE devices DROP INDEX `{$name}`");
                        break; // If successful, stop trying
                    } catch (\Exception $e2) {
                        continue;
                    }
                }
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
                // Restore unique constraint on model
                $table->unique('model', 'devices_model_unique');
            });
        }
    }
};
