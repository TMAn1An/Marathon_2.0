<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('bib_number', 16)->nullable()->unique();
            $table->string('full_name', 150);
            $table->string('university_id', 50)->nullable();
            $table->enum('category', ['student', 'faculty', 'guest']);
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('department', 120)->nullable();
            $table->string('phone', 32);
            $table->string('email', 191);
            $table->string('emergency_contact', 32)->nullable();
            $table->enum('tshirt_size', ['XS', 'S', 'M', 'L', 'XL', 'XXL']);
            $table->enum('status', ['reserved', 'pending_payment', 'confirmed', 'cancelled'])
                ->default('reserved');
            $table->timestamp('slot_reserved_until')->nullable();
            $table->timestamp('confirmed_at')->nullable();

            $table->string('chip_time', 16)->nullable();
            $table->unsignedInteger('overall_place')->nullable();
            $table->unsignedInteger('gender_place')->nullable();

            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'category']);
            $table->index(['event_id', 'status']);
            $table->index(['event_id', 'email']);
            $table->index(['event_id', 'phone']);
            $table->index('slot_reserved_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
