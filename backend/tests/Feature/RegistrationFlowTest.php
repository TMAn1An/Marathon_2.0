<?php

namespace Tests\Feature;

use App\Models\Participant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    private array $payload = [
        'full_name' => 'Rafi Ahmed',
        'id_number' => '22203037',
        'category' => 'student',
        'phone' => '+880 1712-345678',
        'email' => 'Rafi@Example.com',
        'emergency_contact' => '01811111111',
        'tshirt_size' => 'M',
    ];

    public function test_registration_reserves_a_slot_and_hides_contact_details(): void
    {
        $res = $this->postJson('/api/registration', $this->payload)->assertCreated();

        $res->assertJsonPath('data.participant.full_name', 'Rafi Ahmed')
            ->assertJsonPath('data.fee', 500)
            ->assertJsonMissingPath('data.participant.email')
            ->assertJsonMissingPath('data.participant.phone')
            ->assertJsonMissingPath('data.participant.id');

        $this->assertDatabaseHas('participants', ['email' => 'rafi@example.com', 'phone' => '+8801712345678']);
    }

    public function test_duplicate_active_registration_is_rejected(): void
    {
        $this->postJson('/api/registration', $this->payload)->assertCreated();
        $this->postJson('/api/registration', $this->payload)->assertStatus(409);
    }

    public function test_expired_reservation_can_register_again(): void
    {
        $this->postJson('/api/registration', $this->payload)->assertCreated();
        Participant::query()->update(['slot_reserved_until' => now()->subMinute()]);

        $this->postJson('/api/registration', $this->payload)->assertCreated();
        $this->assertSame(1, Participant::where('status', 'cancelled')->count());
        $this->assertSame(1, Participant::where('status', 'reserved')->count());
    }

    public function test_registration_closes_when_full(): void
    {
        config(['marathon.slots.total' => 1]);
        $this->postJson('/api/registration', $this->payload)->assertCreated();

        $other = array_merge($this->payload, ['email' => 'b@example.com', 'phone' => '01922222222']);
        $this->postJson('/api/registration', $other)->assertStatus(410);
    }

    public function test_categories_come_from_config_and_set_the_fee(): void
    {
        config(['marathon.categories' => [
            'elite' => ['label' => 'Elite', 'fee' => 1500],
        ]]);

        $this->postJson('/api/registration', array_merge($this->payload, ['category' => 'student']))
            ->assertStatus(422);

        $this->postJson('/api/registration', array_merge($this->payload, ['category' => 'elite']))
            ->assertCreated()
            ->assertJsonPath('data.fee', 1500)
            ->assertJsonPath('data.participant.category_label', 'Elite');
    }

    public function test_id_number_is_optional(): void
    {
        unset($this->payload['id_number']);

        $this->postJson('/api/registration', $this->payload)->assertCreated();
    }
}
