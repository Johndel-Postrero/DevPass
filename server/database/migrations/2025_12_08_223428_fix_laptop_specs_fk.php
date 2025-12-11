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
        // This migration ensures model FK relationship per database diagram
        // devices.model FK references laptop_specifications.model (reverse of what was attempted)
        
        // First, ensure laptop_specifications.model is unique (required for FK reference)
        if (Schema::hasTable('laptop_specifications')) {
            // Drop laptop_id column and FK if they exist (old approach)
            if (Schema::hasColumn('laptop_specifications', 'laptop_id')) {
                try {
                    // Drop FK first
                    $foreignKeys = DB::select("
                        SELECT CONSTRAINT_NAME 
                        FROM information_schema.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'laptop_specifications' 
                        AND COLUMN_NAME = 'laptop_id'
                        AND REFERENCED_TABLE_NAME = 'devices'
                    ");
                    
                    foreach ($foreignKeys as $fk) {
                        try {
                            DB::statement("ALTER TABLE laptop_specifications DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
                        } catch (\Exception $e) {
                            // Continue
                        }
                    }
                    
                    // Drop unique constraint on laptop_id
                    $uniqueConstraints = DB::select("
                        SELECT CONSTRAINT_NAME 
                        FROM information_schema.TABLE_CONSTRAINTS 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'laptop_specifications' 
                        AND CONSTRAINT_TYPE = 'UNIQUE'
                        AND CONSTRAINT_NAME IN (
                            SELECT CONSTRAINT_NAME 
                            FROM information_schema.KEY_COLUMN_USAGE 
                            WHERE TABLE_SCHEMA = DATABASE() 
                            AND TABLE_NAME = 'laptop_specifications' 
                            AND COLUMN_NAME = 'laptop_id'
                        )
                    ");
                    
                    foreach ($uniqueConstraints as $uc) {
                        try {
                            DB::statement("ALTER TABLE laptop_specifications DROP INDEX `{$uc->CONSTRAINT_NAME}`");
                        } catch (\Exception $e) {
                            // Continue
                        }
                    }
                    
                    // Drop laptop_id column
                    Schema::table('laptop_specifications', function (Blueprint $table) {
                        $table->dropColumn('laptop_id');
                    });
                } catch (\Exception $e) {
                    // Continue if errors
                }
            }
            
            // Ensure model column exists and is NOT NULL and UNIQUE
            if (!Schema::hasColumn('laptop_specifications', 'model')) {
                Schema::table('laptop_specifications', function (Blueprint $table) {
                    $table->string('model', 100)->unique()->after('spec_id');
                });
            } else {
                // Make model NOT NULL and ensure it's unique
                Schema::table('laptop_specifications', function (Blueprint $table) {
                    $table->string('model', 100)->nullable(false)->change();
                });
                
                // Add unique constraint if not exists
                $existingModelUnique = DB::select("
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.TABLE_CONSTRAINTS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'laptop_specifications' 
                    AND CONSTRAINT_TYPE = 'UNIQUE'
                    AND CONSTRAINT_NAME IN (
                        SELECT CONSTRAINT_NAME 
                        FROM information_schema.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'laptop_specifications' 
                        AND COLUMN_NAME = 'model'
                    )
                ");
                
                if (empty($existingModelUnique)) {
                    Schema::table('laptop_specifications', function (Blueprint $table) {
                        $table->unique('model', 'laptop_specifications_model_unique');
                    });
                }
            }
        }
        
        // Now add FK in devices table: devices.model references laptop_specifications.model
        if (Schema::hasTable('devices') && Schema::hasTable('laptop_specifications')) {
            // Remove unique constraint from devices.model if it exists (multiple devices can share model)
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
                // Continue
            }
            
            // Add FK: devices.model references laptop_specifications.model
            $existingFK = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'devices' 
                AND COLUMN_NAME = 'model'
                AND REFERENCED_TABLE_NAME = 'laptop_specifications'
                AND REFERENCED_COLUMN_NAME = 'model'
            ");
            
            if (empty($existingFK)) {
                Schema::table('devices', function (Blueprint $table) {
                    $table->foreign('model')->references('model')->on('laptop_specifications')->onDelete('restrict');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop FK from devices.model
        if (Schema::hasTable('devices')) {
            try {
                $foreignKeys = DB::select("
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'devices' 
                    AND COLUMN_NAME = 'model'
                    AND REFERENCED_TABLE_NAME = 'laptop_specifications'
                ");
                
                foreach ($foreignKeys as $fk) {
                    try {
                        DB::statement("ALTER TABLE devices DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
                    } catch (\Exception $e) {
                        // Continue
                    }
                }
            } catch (\Exception $e) {
                // Continue
            }
        }
        
        // Drop unique constraint from laptop_specifications.model
        if (Schema::hasTable('laptop_specifications')) {
            try {
                DB::statement("ALTER TABLE laptop_specifications DROP INDEX laptop_specifications_model_unique");
            } catch (\Exception $e) {
                // Continue
            }
        }
    }
};
