<?php

namespace Database\Seeders;

use App\Models\Volunteer;
use Illuminate\Database\Seeder;

class VolunteerSeeder extends Seeder
{
    public function run(): void
    {
        // i.pravatar.cc returns square 300x300 portrait placeholders that
        // fall back to a local placeholder via SafeImage on the frontend.
        $portrait = fn (int $seed) => 'https://i.pravatar.cc/300?img='.$seed;

        $rows = [
            ['name' => 'Dr. Aisha Rahman', 'role' => 'Race Director',         'bio' => 'Demo data: owns overall planning and execution.', 'photo_url' => $portrait(5)],
            ['name' => 'Tanvir Ahmed',     'role' => 'Course Marshal Lead',  'bio' => 'Coordinates the on-course volunteer team across the course.', 'photo_url' => $portrait(33)],
            ['name' => 'Nusrat Jahan',     'role' => 'Volunteer Coordinator', 'bio' => 'Recruits, schedules and trains all event-day volunteers.', 'photo_url' => $portrait(48)],
            ['name' => 'Imran Hossain',    'role' => 'Logistics Lead',       'bio' => 'BIB pickup, race-pack distribution and hydration logistics.', 'photo_url' => $portrait(15)],
            ['name' => 'Sadia Karim',      'role' => 'Medical Liaison',      'bio' => 'On-site medical and first-aid coordination with the health partner.', 'photo_url' => $portrait(45)],
            ['name' => 'Rakib Hasan',      'role' => 'Tech & Timing',        'bio' => 'Owns chip timing, results sync and the public website on race day.', 'photo_url' => $portrait(11)],
        ];

        foreach ($rows as $i => $row) {
            Volunteer::updateOrCreate(
                ['name' => $row['name']],
                $row + ['display_order' => $i + 1, 'is_active' => true]
            );
        }
    }
}
