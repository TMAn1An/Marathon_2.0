<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title', 180);
            $table->string('slug', 200)->unique();
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->string('location', 180)->nullable();
            $table->string('hero_image_path')->nullable();
            $table->dateTime('event_date');
            $table->dateTime('registration_unlock_at')->nullable();
            $table->unsignedInteger('total_slots')->default(400);
            $table->unsignedInteger('guest_slot_limit')->default(30);
            $table->unsignedInteger('hold_minutes')->default(10);
            $table->unsignedInteger('student_fee_bdt')->default(500);
            $table->unsignedInteger('faculty_fee_bdt')->default(800);
            $table->enum('status', ['upcoming', 'live', 'past'])->default('upcoming');
            $table->boolean('manual_override')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index('status');
            $table->index('event_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
