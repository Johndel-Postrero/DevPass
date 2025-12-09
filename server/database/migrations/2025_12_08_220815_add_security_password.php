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
        // NOTE: Password column is now included in the original create_security_guards_table.php migration
        // This migration is kept for backward compatibility with existing databases
        if (Schema::hasTable('security_guards')) {
            Schema::table('security_guards', function (Blueprint $table) {
                if (!Schema::hasColumn('security_guards', 'password')) {
                    $table->string('password')->nullable()->after('phone');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('security_guards')) {
            Schema::table('security_guards', function (Blueprint $table) {
                if (Schema::hasColumn('security_guards', 'password')) {
                    $table->dropColumn('password');
                }
            });
        }
    }
};
