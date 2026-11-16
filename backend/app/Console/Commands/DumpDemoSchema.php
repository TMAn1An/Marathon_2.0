<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DumpDemoSchema extends Command
{
    protected $signature = 'marathon:dump-demo-schema';

    protected $description = 'Write database/demo-schema.sql from the current SQLite database (used by the Vercel demo bootstrap)';

    public function handle(): int
    {
        if (DB::getDriverName() !== 'sqlite') {
            $this->error('Run this against a freshly migrated SQLite database.');

            return self::FAILURE;
        }

        $sql = "-- Generated from the migrations; loaded on Vercel cold start (see api/index.php).\n"
            ."-- Regenerate with: php artisan marathon:dump-demo-schema\n";

        foreach (DB::select('SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE "sqlite_%" ORDER BY rowid') as $row) {
            $sql .= $row->sql.";\n";
        }
        foreach (DB::table('migrations')->orderBy('id')->get() as $m) {
            $sql .= 'INSERT INTO migrations (migration, batch) VALUES ('.DB::getPdo()->quote($m->migration).', '.(int) $m->batch.");\n";
        }

        file_put_contents(database_path('demo-schema.sql'), $sql);
        $this->info('database/demo-schema.sql written.');

        return self::SUCCESS;
    }
}
