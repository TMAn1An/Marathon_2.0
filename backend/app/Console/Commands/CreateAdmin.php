<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;

class CreateAdmin extends Command
{
    protected $signature = 'marathon:create-admin {email} {--name=Marathon Administrator} {--password=}';

    protected $description = 'Create or update an admin account (prompts for the password if omitted)';

    public function handle(): int
    {
        $password = $this->option('password') ?: $this->secret('Password (min 12 characters)');

        if (strlen((string) $password) < 12) {
            $this->error('Password must be at least 12 characters.');

            return self::FAILURE;
        }

        Admin::updateOrCreate(
            ['email' => strtolower($this->argument('email'))],
            ['name' => $this->option('name'), 'password' => $password, 'role' => Admin::ROLE_SUPER_ADMIN, 'is_active' => true]
        );

        $this->info('Admin saved.');

        return self::SUCCESS;
    }
}
