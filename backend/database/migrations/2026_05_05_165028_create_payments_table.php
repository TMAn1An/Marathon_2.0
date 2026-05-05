<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')
                ->constrained('participants')
                ->cascadeOnDelete();
            $table->string('transaction_id', 64)->unique();
            $table->decimal('amount', 10, 2);
            $table->enum('gateway', ['bkash', 'nagad', 'manual']);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('payer_phone', 32)->nullable();
            $table->string('gateway_reference', 191)->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->string('failure_reason', 255)->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('gateway');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
