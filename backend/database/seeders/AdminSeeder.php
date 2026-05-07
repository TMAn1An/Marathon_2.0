<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'superadmin@iubat.edu'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('super12345'),
                'role' => Admin::ROLE_SUPER_ADMIN,
                'is_active' => true,
            ]
        );

        Admin::updateOrCreate(
            ['email' => 'admin@iubat.edu'],
            [
                'name' => 'Marathon Administrator',
                'password' => Hash::make('admin12345'),
                'role' => Admin::ROLE_ADMIN,
                'is_active' => true,
            ]
        );
    }
}
