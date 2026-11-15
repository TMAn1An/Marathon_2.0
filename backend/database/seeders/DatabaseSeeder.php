<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(AdminSeeder::class);

        // Sample sponsors/volunteers are invented demo content. They are only
        // seeded in local/testing so they can never appear on a live site;
        // add the real ones from the admin panel.
        if (app()->environment(['local', 'testing'])) {
            $this->call([
                SponsorSeeder::class,
                VolunteerSeeder::class,
            ]);
        }
    }
}
