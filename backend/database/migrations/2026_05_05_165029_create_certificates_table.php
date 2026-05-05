<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')
                ->constrained('participants')
                ->cascadeOnDelete();
            $table->uuid('certificate_uuid')->unique();
            $table->string('file_path', 255)->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamps();

            $table->index('participant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
