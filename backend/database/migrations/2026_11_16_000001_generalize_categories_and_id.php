<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Categories are now configurable (config/marathon.php), so the
        // fixed student/faculty enum becomes a plain string.
        Schema::table('participants', function (Blueprint $table) {
            $table->string('category', 32)->change();
        });

        DB::table('participants')->where('category', 'faculty')->update(['category' => 'open']);

        // The ID number is a generic, optional field (student / member / club ID).
        Schema::table('participants', function (Blueprint $table) {
            $table->renameColumn('university_id', 'id_number');
        });
        Schema::table('participants', function (Blueprint $table) {
            $table->string('id_number', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->renameColumn('id_number', 'university_id');
        });
    }
};
