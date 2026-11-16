<?php

/*
|--------------------------------------------------------------------------
| Vercel serverless entry point (vercel-php runtime)
|--------------------------------------------------------------------------
| The deployment filesystem is read-only except /tmp, so Laravel's storage
| and bootstrap caches are redirected there via env (see vercel.json). Data
| lives in Turso (DB_CONNECTION=turso), never on the function's disk.
*/

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

foreach (['framework/views', 'framework/cache', 'framework/sessions', 'logs', 'app'] as $dir) {
    if (! is_dir("/tmp/storage/{$dir}")) {
        mkdir("/tmp/storage/{$dir}", 0777, true);
    }
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

// The runtime reports SCRIPT_NAME=/api/index.php, which makes Symfony treat
// "/api" as the base URL and strip it from /api/* routes. Present the request
// to Laravel as if it hit public/index.php at the web root.
$_SERVER['SCRIPT_NAME'] = $_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/../public/index.php';
unset($_SERVER['PATH_INFO']);

$app->handleRequest(Request::capture());
