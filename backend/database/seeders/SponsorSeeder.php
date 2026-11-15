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
                'name' => 'Example Title Sponsor',
                'tier' => 'platinum',
                'website' => 'https://example.com',
                'logo_url' => $logo('Title Sponsor'),
                'description' => 'Demo data: title sponsor.',
                'display_order' => 1,
            ],
            [
                'name' => 'Example Alumni Network',
                'tier' => 'gold',
                'website' => 'https://example.com',
                'logo_url' => $logo('Alumni'),
                'description' => 'Demo data: community partner.',
                'display_order' => 2,
            ],
            [
                'name' => 'Example Running Club',
                'tier' => 'silver',
                'logo_url' => $logo('Running Club'),
                'description' => 'Demo data: race day operations partner.',
                'display_order' => 3,
            ],
            [
                'name' => 'Example Hydration Co.',
                'tier' => 'gold',
                'website' => 'https://example.com',
                'logo_url' => $logo('Hydration Co.'),
                'description' => 'Official hydration partner — water + electrolyte stations.',
                'display_order' => 4,
            ],
            [
                'name' => 'Example Health',
                'tier' => 'bronze',
                'logo_url' => $logo('Example Health'),
                'description' => 'On-site medical and first-aid support.',
                'display_order' => 5,
            ],
            [
                'name' => 'Example Apparel',
                'tier' => 'partner',
                'logo_url' => $logo('Apparel'),
                'description' => 'Race-day t-shirt printing partner.',
                'display_order' => 6,
            ],
        ];

        foreach ($rows as $row) {
            Sponsor::updateOrCreate(['name' => $row['name']], $row + ['is_active' => true]);
        }
    }
}
