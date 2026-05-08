<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Participant;
use App\Services\BibService;
use Illuminate\Database\Seeder;

class ParticipantSeeder extends Seeder
{
    public function run(): void
    {
        $past = Event::query()->where('status', Event::STATUS_PAST)->first();
        if (! $past) {
            return;
        }

        $bibs = app(BibService::class);

        $sample = [
            ['Aisha Khan', 'student', 'female', 'CSE', '17:42'],
            ['Rakib Hasan', 'student', 'male', 'CSE', '18:05'],
            ['Nadia Sultana', 'faculty', 'female', 'CSE', '19:11'],
            ['Sajid Rahman', 'student', 'male', 'EEE', '17:56'],
            ['Tania Akhter', 'student', 'female', 'BBA', '20:33'],
        ];

        foreach ($sample as $i => [$name, $category, $gender, $dept, $time]) {
            $participant = Participant::updateOrCreate(
                ['event_id' => $past->id, 'email' => strtolower(str_replace(' ', '.', $name)).'@example.com'],
                [
                    'full_name' => $name,
                    'university_id' => 'IUB-'.(202000 + $i),
                    'category' => $category,
                    'gender' => $gender,
                    'department' => $dept,
                    'phone' => '+8801700000'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                    'emergency_contact' => '+8801800000000',
                    'tshirt_size' => ['S', 'M', 'L', 'XL'][$i % 4],
                    'status' => Participant::STATUS_CONFIRMED,
                    'confirmed_at' => $past->event_start_date,
                    'chip_time' => $time,
                    'overall_place' => $i + 1,
                    'gender_place' => floor($i / 2) + 1,
                ]
            );

            if (! $participant->bib_number) {
                $bibs->assign($participant);
            }
        }
    }
}
