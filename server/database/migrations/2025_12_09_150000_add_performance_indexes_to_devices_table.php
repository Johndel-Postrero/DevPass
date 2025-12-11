<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds performance index to devices table for registration_status column.
     * Note: student_id and model already have indexes from their foreign keys.
     */
    public function up(): void
    {
        if (Schema::hasTable('devices')) {
            Schema::table('devices', function (Blueprint $table) {
                // Index on registration_status - frequently used in WHERE clauses for filtering by status
                // Note: student_id and model already have indexes from their foreign keys, so we only need this one
                if (!$this->indexExists('devices', 'devices_registration_status_index')) {
                    $table->index('registration_status', 'devices_registration_status_index');
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
                $table->dropIndex('devices_registration_status_index');
            });
        }
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists($table, $indexName): bool
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        
        $result = $connection->select(
            "SELECT COUNT(*) as count 
             FROM information_schema.statistics 
             WHERE table_schema = ? 
             AND table_name = ? 
             AND index_name = ?",
            [$databaseName, $table, $indexName]
        );
        
        return $result[0]->count > 0;
    }
};

