<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->unique()->constrained('events')->cascadeOnDelete();
            $table->string('primary_color', 12)->default('#ED1C24');
            $table->string('signature_1_path')->nullable();
            $table->string('signature_1_name', 120)->nullable();
            $table->string('signature_1_designation', 160)->nullable();
            $table->string('signature_2_path')->nullable();
            $table->string('signature_2_name', 120)->nullable();
            $table->string('signature_2_designation', 160)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_templates');
    }
};
