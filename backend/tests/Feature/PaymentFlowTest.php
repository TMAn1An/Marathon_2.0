<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Participant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    private function startCheckout(string $gateway = 'bkash'): array
    {
        $participant = Participant::factory()->create();
        $tx = $this->postJson('/api/payments/initiate', [
            'participant_token' => $participant->public_token,
            'gateway' => $gateway,
        ])->assertCreated()->json('data.transaction_id');

        return [$participant, $tx];
    }

    public function test_public_confirm_endpoint_is_closed_in_manual_mode(): void
    {
        config(['marathon.payments.mode' => 'manual']);
        [$participant, $tx] = $this->startCheckout();

        $this->postJson('/api/payments/confirm', [
            'transaction_id' => $tx,
            'participant_token' => $participant->public_token,
            'outcome' => 'success',
        ])->assertNotFound();

        $this->assertSame('pending_payment', $participant->fresh()->status);
    }

    public function test_simulated_mode_confirms_and_assigns_sequential_bib(): void
    {
        config(['marathon.payments.mode' => 'simulated']);
        [$participant, $tx] = $this->startCheckout('nagad');

        $this->postJson('/api/payments/confirm', [
            'transaction_id' => $tx,
            'participant_token' => $participant->public_token,
            'outcome' => 'success',
        ])->assertOk()->assertJsonPath('data.participant.bib_number', 'RUN0001');

        [$second, $tx2] = $this->startCheckout();
        $this->postJson('/api/payments/confirm', [
            'transaction_id' => $tx2,
            'participant_token' => $second->public_token,
            'outcome' => 'success',
        ])->assertJsonPath('data.participant.bib_number', 'RUN0002');
    }

    public function test_cannot_confirm_someone_elses_transaction(): void
    {
        config(['marathon.payments.mode' => 'simulated']);
        [, $tx] = $this->startCheckout();
        $stranger = Participant::factory()->create();

        $this->postJson('/api/payments/confirm', [
            'transaction_id' => $tx,
            'participant_token' => $stranger->public_token,
            'outcome' => 'success',
        ])->assertNotFound();
    }

    public function test_manual_flow_submit_trxid_then_admin_verifies(): void
    {
        config(['marathon.payments.mode' => 'manual']);
        [$participant, $tx] = $this->startCheckout();

        $this->postJson('/api/payments/submit', [
            'transaction_id' => $tx,
            'participant_token' => $participant->public_token,
            'reference' => '9ab3kd82xq',
        ])->assertOk()->assertJsonPath('data.submitted_reference', '9AB3KD82XQ');

        // The slot is now held for the verification window, not 10 minutes.
        $this->assertTrue($participant->fresh()->slot_reserved_until->gt(now()->addHours(24)));

        $admin = Admin::create(['name' => 'A', 'email' => 'a@example.com', 'password' => 'secret-password-1', 'role' => 'admin', 'is_active' => true]);
        $this->actingAs($admin, 'admin')
            ->postJson("/api/admin/participants/{$participant->id}/verify-payment")
            ->assertOk();

        $this->assertSame('confirmed', $participant->fresh()->status);
        $this->assertNotNull($participant->fresh()->bib_number);
    }

    public function test_a_trxid_cannot_be_reused(): void
    {
        config(['marathon.payments.mode' => 'manual']);
        [$a, $txA] = $this->startCheckout();
        [$b, $txB] = $this->startCheckout();

        $this->postJson('/api/payments/submit', ['transaction_id' => $txA, 'participant_token' => $a->public_token, 'reference' => 'ABC123XYZ'])->assertOk();
        $this->postJson('/api/payments/submit', ['transaction_id' => $txB, 'participant_token' => $b->public_token, 'reference' => 'abc123xyz'])->assertStatus(409);
    }

    public function test_admin_routes_require_authentication(): void
    {
        $this->getJson('/api/admin/participants')->assertUnauthorized();
        $this->postJson('/api/admin/results/import', ['rows' => []])->assertUnauthorized();
    }
}
