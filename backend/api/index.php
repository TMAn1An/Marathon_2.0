<?php

/*
|--------------------------------------------------------------------------
| Vercel serverless entry point (vercel-php runtime)
|--------------------------------------------------------------------------
| The deployment filesystem is read-only except /tmp, so Laravel's storage
| and bootstrap caches are redirected there via env (see vercel.json).
|
| Demo mode: when DB_CONNECTION=sqlite and the /tmp database does not exist
| yet (cold start), it is created, migrated and seeded. That data is
| ephemeral. For real use, point DB_URL at a managed MySQL/Postgres and the
| bootstrap below is skipped automatically.
*/

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// TEMP-DEBUG
if (isset($_GET['__debug'])) { header('Content-Type: application/json'); echo json_encode(array_intersect_key($_SERVER, array_flip(['REQUEST_URI','SCRIPT_NAME','SCRIPT_FILENAME','PATH_INFO','PHP_SELF','QUERY_STRING','DOCUMENT_ROOT','REQUEST_METHOD']))); exit; }

foreach (['framework/views', 'framework/cache', 'framework/sessions', 'logs', 'app'] as $dir) {
    if (! is_dir("/tmp/storage/{$dir}")) {
        mkdir("/tmp/storage/{$dir}", 0777, true);
    }
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$database = getenv('DB_DATABASE');
if (getenv('DB_CONNECTION') === 'sqlite' && $database && ! file_exists($database)) {
    touch($database);
    $app->make(Kernel::class)
        ->call('migrate', ['--force' => true, '--seed' => true]);
}

$app->handleRequest(Request::capture());
