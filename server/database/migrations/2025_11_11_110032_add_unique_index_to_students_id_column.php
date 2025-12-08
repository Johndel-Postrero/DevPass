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
        if (Schema::hasTable('students')) {
            // Check if unique index already exists
            $indexExists = DB::select("SHOW INDEX FROM students WHERE Key_name = 'students_id_unique'");
            
            if (empty($indexExists)) {
                Schema::table('students', function (Blueprint $table) {
                    $table->unique('id', 'students_id_unique');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('students')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropUnique('students_id_unique');
            });
        }
    }
};
