<?php

namespace App\Providers;

use App\Database\Turso\TursoConnection;
use App\Database\Turso\TursoPdo;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // `turso` connections reuse Laravel's SQLite grammar over Turso's HTTP API.
        $this->callAfterResolving('db', function ($db) {
            $db->extend('turso', fn (array $config, string $name) => new TursoConnection(
                new TursoPdo($config['endpoint'], $config['auth_token']),
                $config['database'] ?? '',
                $config['prefix'] ?? '',
                $config + ['name' => $name],
            ));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
