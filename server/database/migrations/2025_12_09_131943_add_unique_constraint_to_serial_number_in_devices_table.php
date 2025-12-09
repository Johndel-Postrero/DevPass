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
        // First, clean up duplicate serial numbers
        // Keep the first occurrence (by laptop_id) and set duplicates to NULL
        DB::statement("
            UPDATE devices d1
            INNER JOIN (
                SELECT serial_number, MIN(laptop_id) as first_laptop_id
                FROM devices
                WHERE serial_number IS NOT NULL
                GROUP BY serial_number
                HAVING COUNT(*) > 1
            ) d2 ON d1.serial_number = d2.serial_number
            SET d1.serial_number = NULL
            WHERE d1.laptop_id != d2.first_laptop_id
        ");

        // Now add unique index for serial_number
        // Note: In MySQL, NULL values are not considered equal, so multiple NULLs are allowed
        // but non-NULL values must be unique across all students
        Schema::table('devices', function (Blueprint $table) {
            $table->unique('serial_number', 'devices_serial_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropUnique('devices_serial_number_unique');
        });
    }
};
