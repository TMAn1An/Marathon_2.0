<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Creates the first super-admin from ADMIN_EMAIL / ADMIN_PASSWORD.
     * There is deliberately no built-in default password in production;
     * use `php artisan marathon:create-admin` for later accounts.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password) {
            if (app()->isProduction()) {
                $this->command?->warn('ADMIN_EMAIL / ADMIN_PASSWORD not set – no admin created. Run `php artisan marathon:create-admin`.');

                return;
            }
            [$email, $password] = ['admin@example.com', 'password-change-me'];
            $this->command?->warn("Local dev admin created: {$email} / {$password}");
        }

        Admin::updateOrCreate(
            ['email' => $email],
            ['name' => 'Marathon Administrator', 'password' => $password, 'role' => Admin::ROLE_SUPER_ADMIN, 'is_active' => true]
        );
    }
}
