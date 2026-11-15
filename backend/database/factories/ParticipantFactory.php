<?php

namespace Database\Factories;

use App\Models\Participant;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Participant> */
class ParticipantFactory extends Factory
{
    protected $model = Participant::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'id_number' => (string) fake()->unique()->numerify('2220####'),
            'category' => 'student',
            'phone' => '+88017'.fake()->unique()->numerify('########'),
            'email' => fake()->unique()->safeEmail(),
            'emergency_contact' => '+88018'.fake()->numerify('########'),
            'tshirt_size' => 'M',
            'status' => Participant::STATUS_RESERVED,
            'slot_reserved_until' => now()->addMinutes(10),
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn () => [
            'status' => Participant::STATUS_CONFIRMED,
            'slot_reserved_until' => null,
            'confirmed_at' => now(),
        ]);
    }
}
