<?php

namespace Database\Seeders;

use App\Models\Sponsor;
use Illuminate\Database\Seeder;

class SponsorSeeder extends Seeder
{
    public function run(): void
    {
        $logo = fn (string $name) => 'https://placehold.co/240x80/eefdf2/0d723c?text='.rawurlencode($name);

        $rows = [
            [
                'name' => 'IUBAT University',
                'tier' => 'platinum',
                'website' => 'https://www.iubat.edu/',
                'logo_url' => $logo('IUBAT'),
                'description' => 'Title sponsor and host institution.',
                'display_order' => 1,
            ],
            [
                'name' => 'CSE Alumni Association',
                'tier' => 'gold',
                'website' => 'https://www.iubat.edu/cse',
                'logo_url' => $logo('CSE Alumni'),
                'description' => 'Supporting student-led events since 2010.',
                'display_order' => 2,
            ],
            [
                'name' => 'IUBAT Sports Club',
                'tier' => 'silver',
                'logo_url' => $logo('Sports Club'),
                'description' => 'Race day operations partner.',
                'display_order' => 3,
            ],
            [
                'name' => 'Apex Hydration Co.',
                'tier' => 'gold',
                'website' => 'https://example.com',
                'logo_url' => $logo('Apex Hydration'),
                'description' => 'Official hydration partner — water + electrolyte stations.',
                'display_order' => 4,
            ],
            [
                'name' => 'Greenline Health',
                'tier' => 'bronze',
                'logo_url' => $logo('Greenline Health'),
                'description' => 'On-site medical and first-aid support.',
                'display_order' => 5,
            ],
            [
                'name' => 'CityRun Apparel',
                'tier' => 'partner',
                'logo_url' => $logo('CityRun'),
                'description' => 'Race-day t-shirt printing partner.',
                'display_order' => 6,
            ],
        ];

        foreach ($rows as $row) {
            Sponsor::updateOrCreate(['name' => $row['name']], $row + ['is_active' => true]);
        }
    }
}
