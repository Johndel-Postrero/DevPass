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
        if (Schema::hasTable('laptop_specifications')) {
            // Drop the old foreign key constraint on model
            try {
                // Get foreign key constraint name
                $foreignKeys = DB::select("
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'laptop_specifications' 
                    AND COLUMN_NAME = 'model'
                    AND REFERENCED_TABLE_NAME = 'devices'
                ");
                
                foreach ($foreignKeys as $fk) {
                    try {
                        DB::statement("ALTER TABLE laptop_specifications DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
                    } catch (\Exception $e) {
                        // Continue if FK doesn't exist
                    }
                }
            } catch (\Exception $e) {
                // Continue if query fails
            }
            
            // Add laptop_id column if it doesn't exist
            if (!Schema::hasColumn('laptop_specifications', 'laptop_id')) {
                Schema::table('laptop_specifications', function (Blueprint $table) {
                    $table->unsignedBigInteger('laptop_id')->nullable()->after('spec_id');
                });
                
                // Migrate data: get laptop_id from devices table based on model
                DB::statement('
                    UPDATE laptop_specifications ls
                    INNER JOIN devices d ON ls.model = d.model
                    SET ls.laptop_id = d.laptop_id
                    WHERE d.laptop_id IS NOT NULL
                ');
                
                // Make laptop_id NOT NULL after data migration
                Schema::table('laptop_specifications', function (Blueprint $table) {
                    $table->unsignedBigInteger('laptop_id')->nullable(false)->change();
                });
            }
            
            // Add foreign key constraint to laptop_id (PK)
            Schema::table('laptop_specifications', function (Blueprint $table) {
                try {
                    $table->foreign('laptop_id')->references('laptop_id')->on('devices')->onDelete('cascade');
                } catch (\Exception $e) {
                    // FK might already exist
                }
            });
            
            // Add unique constraint on laptop_id (one-to-one relationship)
            Schema::table('laptop_specifications', function (Blueprint $table) {
                try {
                    $table->unique('laptop_id');
                } catch (\Exception $e) {
                    // Unique constraint might already exist
                }
            });
            
            // Make model nullable (no longer used as FK, just for reference)
            Schema::table('laptop_specifications', function (Blueprint $table) {
                $table->string('model')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('laptop_specifications')) {
            Schema::table('laptop_specifications', function (Blueprint $table) {
                // Drop new FK and unique constraint
                try {
                    $table->dropForeign(['laptop_id']);
                } catch (\Exception $e) {
                    // Continue
                }
                try {
                    $table->dropUnique(['laptop_id']);
                } catch (\Exception $e) {
                    // Continue
                }
                
                // Drop laptop_id column
                if (Schema::hasColumn('laptop_specifications', 'laptop_id')) {
                    $table->dropColumn('laptop_id');
                }
                
                // Restore model as NOT NULL
                $table->string('model')->nullable(false)->change();
                
                // Restore old FK (if needed)
                // $table->foreign('model')->references('model')->on('devices')->onDelete('cascade');
            });
        }
    }
};
