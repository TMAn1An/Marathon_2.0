<?php

namespace Database\Seeders;

use App\Models\CertificateTemplate;
use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'total_slots' => (int) config('marathon.event_defaults.total_slots'),
            'guest_slot_limit' => (int) config('marathon.event_defaults.guest_slot_limit'),
            'hold_minutes' => (int) config('marathon.event_defaults.hold_minutes'),
            'student_fee_bdt' => (int) config('marathon.event_defaults.student_fee_bdt'),
            'faculty_fee_bdt' => (int) config('marathon.event_defaults.faculty_fee_bdt'),
        ];

        $events = [
            [
                'title' => 'IUBAT SCSE MINI Marathon — Edition 2026',
                'slug' => 'scse-mini-marathon-2026',
                'summary' => 'Run with knowledge, finish with pride. The flagship campus run for IUBAT students, faculty and friends of the SCSE community.',
                'description' => "<p>The IUBAT School of Computer Science &amp; Engineering invites runners of every level to its 2026 mini marathon. Expect a scenic 5K loop around the Uttara campus, BIB-timed results, finisher T-shirts and certificates rendered live by our event engine.</p><p>Slots are limited &mdash; secure yours when registration unlocks.</p>",
                'location' => 'IUBAT Main Campus, Uttara, Dhaka',
                'event_date' => now()->copy()->addMonths(8)->setTime(7, 0),
                'registration_unlock_at' => now()->copy()->addDays(20),
                'status' => Event::STATUS_UPCOMING,
            ],
            [
                'title' => 'SCSE Sunrise Sprint',
                'slug' => 'scse-sunrise-sprint',
                'summary' => 'A live community fun-run streaming today from the IUBAT track — cheer on your favourite runner.',
                'description' => "<p>Live race coverage. Real-time results posted as runners cross the line.</p>",
                'location' => 'IUBAT Athletic Track, Uttara',
                'event_date' => now()->copy()->subHours(2),
                'registration_unlock_at' => now()->copy()->subWeeks(2),
                'status' => Event::STATUS_LIVE,
                'manual_override' => true,
            ],
            [
                'title' => 'IUBAT CSE Spring Run 2025',
                'slug' => 'iubat-cse-spring-run-2025',
                'summary' => 'Last year&rsquo;s SCSE community run — relive the highlights and download your certificate.',
                'description' => "<p>Three hundred and seventy-two finishers, two hundred volunteers, one unforgettable morning.</p>",
                'location' => 'IUBAT Main Campus, Uttara, Dhaka',
                'event_date' => now()->copy()->subYear(),
                'registration_unlock_at' => now()->copy()->subYear()->subWeeks(4),
                'status' => Event::STATUS_PAST,
                'manual_override' => true,
            ],
        ];

        foreach ($events as $e) {
            $event = Event::updateOrCreate(
                ['slug' => $e['slug']],
                array_merge($defaults, $e),
            );

            CertificateTemplate::updateOrCreate(
                ['event_id' => $event->id],
                [
                    'primary_color' => '#ED1C24',
                    'signature_1_name' => 'Prof. Dr. Utpal Kanti Das',
                    'signature_1_designation' => 'Chairman, School of CSE',
                    'signature_2_name' => 'Md. Imran Hossain',
                    'signature_2_designation' => 'Race Director',
                ]
            );
        }
    }
}
