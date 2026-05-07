<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\GalleryImage;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $event = Event::query()->where('status', Event::STATUS_PAST)->first();

        // Image paths point at picsum.photos / placehold.co via the front-end.
        // For the public storage layout we just store deterministic relative
        // paths so the front-end can render them through SafeImage.
        $images = [
            ['caption' => 'Pre-race warm up', 'width' => 1200, 'height' => 800, 'path' => 'gallery/seeded-001.jpg'],
            ['caption' => 'Start line', 'width' => 1200, 'height' => 1600, 'path' => 'gallery/seeded-002.jpg'],
            ['caption' => 'Cheering volunteers', 'width' => 1600, 'height' => 1000, 'path' => 'gallery/seeded-003.jpg'],
            ['caption' => 'Final stretch', 'width' => 1000, 'height' => 1200, 'path' => 'gallery/seeded-004.jpg'],
            ['caption' => 'Finisher medal', 'width' => 1400, 'height' => 900, 'path' => 'gallery/seeded-005.jpg'],
            ['caption' => 'Cool-down zone', 'width' => 1600, 'height' => 1000, 'path' => 'gallery/seeded-006.jpg'],
        ];

        foreach ($images as $i => $image) {
            GalleryImage::updateOrCreate(
                ['image_path' => $image['path']],
                [
                    'event_id' => $event?->id,
                    'caption' => $image['caption'],
                    'width' => $image['width'],
                    'height' => $image['height'],
                    'sort_order' => $i,
                    'is_published' => true,
                ]
            );
        }
    }
}
