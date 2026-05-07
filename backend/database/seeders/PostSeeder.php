<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Event;
use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::query()->where('email', 'admin@iubat.edu')->first()
            ?? Admin::query()->first();
        if (! $admin) {
            return;
        }

        $upcoming = Event::query()->where('status', Event::STATUS_UPCOMING)->first();
        $live = Event::query()->where('status', Event::STATUS_LIVE)->first();

        $posts = [
            [
                'title' => 'Registration unlocks 2 July 2026',
                'post_type' => Post::TYPE_ANNOUNCEMENT,
                'content' => '<p><strong>Mark your calendar.</strong> The IUBAT SCSE MINI Marathon 2026 registration counter unlocks on <strong>2 July 2026, 12:00 AM Asia/Dhaka.</strong> First 30 BIBs are reserved for invited guests; public BIBs start at <code>MIN_0031</code>.</p>',
                'event_id' => $upcoming?->id,
                'published_at' => now()->subDays(3),
            ],
            [
                'title' => 'Sunrise Sprint live results — track update',
                'post_type' => Post::TYPE_EVENT_UPDATE,
                'content' => '<p>The Sunrise Sprint is in motion. Volunteers at gates 2 and 4 are signalling all clear; medical and hydration stations are fully staffed. Results will be posted to the dashboard as runners cross the line.</p>',
                'event_id' => $live?->id,
                'published_at' => now()->subHours(1),
            ],
            [
                'title' => 'Behind the build: how SCSE built the platform',
                'post_type' => Post::TYPE_GENERAL,
                'content' => '<p>Our platform is built end-to-end by the SCSE team — a multi-event Laravel back-end, a React/Tailwind front-end with Framer Motion + GSAP, and DOMPDF certificates. Curious about a feature? Drop us a line.</p>',
                'event_id' => null,
                'published_at' => now()->subWeek(),
            ],
        ];

        foreach ($posts as $data) {
            $slug = Post::generateUniqueSlug($data['title']);
            Post::updateOrCreate(
                ['title' => $data['title']],
                array_merge($data, [
                    'admin_id' => $admin->id,
                    'is_published' => true,
                    'slug' => $slug,
                ])
            );
        }
    }
}
