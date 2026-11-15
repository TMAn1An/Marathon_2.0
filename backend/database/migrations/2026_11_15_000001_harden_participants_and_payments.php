<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            // Cancelled / expired reservations must not block a later
            // re-registration with the same email or phone. Uniqueness of
            // *active* registrations is enforced in RegistrationService.
            $table->dropUnique(['phone']);
            $table->dropUnique(['email']);
            $table->index('phone');
            $table->index('email');

            // Unguessable handle used by the public checkout flow instead of
            // the sequential primary key.
            $table->string('public_token', 40)->nullable()->unique()->after('id');

            // Race result, stored in whole seconds.
            $table->unsignedInteger('finish_time_seconds')->nullable()->after('confirmed_at');
        });

        DB::table('participants')->whereNull('public_token')->orderBy('id')->each(function ($row) {
            DB::table('participants')->where('id', $row->id)->update([
                'public_token' => strtolower((string) Str::ulid()),
            ]);
        });

        Schema::table('payments', function (Blueprint $table) {
            // Transaction id / reference typed in by the runner for manual
            // bKash / Nagad payments. Unique so one TrxID cannot be reused.
            $table->string('submitted_reference', 64)->nullable()->unique()->after('payer_phone');
            $table->timestamp('submitted_at')->nullable()->after('submitted_reference');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['submitted_reference']);
            $table->dropColumn(['submitted_reference', 'submitted_at']);
        });

        Schema::table('participants', function (Blueprint $table) {
            $table->dropUnique(['public_token']);
            $table->dropColumn(['public_token', 'finish_time_seconds']);
            $table->dropIndex(['phone']);
            $table->dropIndex(['email']);
            $table->unique('phone');
            $table->unique('email');
        });
    }
};
