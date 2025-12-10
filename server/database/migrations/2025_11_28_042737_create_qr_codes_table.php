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
        if (!Schema::hasTable('qr_codes')) {
            Schema::create('qr_codes', function (Blueprint $table) {
                $table->id('qr_id');
                $table->unsignedBigInteger('laptop_id');
                $table->string('qr_code_hash', 255);
                $table->timestamp('generated_at')->nullable();
                $table->timestamp('expires_at');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                $table->foreign('laptop_id')->references('laptop_id')->on('devices')->onDelete('cascade');
                $table->unique('qr_code_hash'); // Per database diagram: unique index
                $table->index('laptop_id'); // Per database diagram: index
                $table->index('is_active'); // Per database diagram: index
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_codes');
    }
};
