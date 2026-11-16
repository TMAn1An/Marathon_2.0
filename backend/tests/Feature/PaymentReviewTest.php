<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\NotificationLog;
use App\Models\Participant;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentReviewTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): Admin
    {
        return Admin::create(['name' => 'A', 'email' => 'a@example.com', 'password' => 'secret-password-1', 'role' => 'admin', 'is_active' => true]);
    }

    /** @return array{0: Participant, 1: Payment} */
    private function submitted(string $trx = 'TRX123ABC'): array
    {
        config(['marathon.payments.mode' => 'manual']);
        $participant = Participant::factory()->create();
        $tx = $this->postJson('/api/payments/initiate', ['participant_token' => $participant->public_token, 'gateway' => 'bkash'])->json('data.transaction_id');
        $this->postJson('/api/payments/submit', ['transaction_id' => $tx, 'participant_token' => $participant->public_token, 'reference' => $trx])->assertOk();

        return [$participant->fresh(), Payment::where('transaction_id', $tx)->first()];
    }

    public function test_queue_lists_only_submitted_payments(): void
    {
        [, $payment] = $this->submitted();
        // An initiated-but-unsubmitted payment must not clutter the queue.
        $other = Participant::factory()->create();
        $this->postJson('/api/payments/initiate', ['participant_token' => $other->public_token, 'gateway' => 'nagad'])->assertCreated();

        $this->actingAs($this->admin(), 'admin')
            ->getJson('/api/admin/payments?status=pending')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $payment->id)
            ->assertJsonPath('data.0.submitted_reference', 'TRX123ABC');
    }

    public function test_approve_confirms_the_runner_and_issues_a_bib(): void
    {
        [$participant, $payment] = $this->submitted();

        $this->actingAs($this->admin(), 'admin')
            ->postJson("/api/admin/payments/{$payment->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertSame('confirmed', $participant->fresh()->status);
        $this->assertSame('RUN0001', $participant->fresh()->bib_number);
    }

    public function test_reject_requires_a_reason_and_reopens_the_hold(): void
    {
        [$participant, $payment] = $this->submitted();
        $admin = $this->admin();

        $this->actingAs($admin, 'admin')->postJson("/api/admin/payments/{$payment->id}/reject", [])->assertStatus(422);

        $this->actingAs($admin, 'admin')
            ->postJson("/api/admin/payments/{$payment->id}/reject", ['reason' => 'TrxID not found'])
            ->assertOk()
            ->assertJsonPath('data.status', 'failed')
            ->assertJsonPath('data.failure_reason', 'TrxID not found');

        $fresh = $participant->fresh();
        $this->assertSame('reserved', $fresh->status);
        $this->assertTrue($fresh->slot_reserved_until->isFuture());
        $this->assertTrue($fresh->slot_reserved_until->lt(now()->addHour()));

        $mail = NotificationLog::where('type', 'payment_rejected')->first();
        $this->assertNotNull($mail);
        $this->assertStringContainsString('TrxID not found', $mail->body);
        $this->assertStringContainsString('/pay/'.$participant->public_token, $mail->body);
    }

    public function test_rejected_runner_can_resume_and_pay_again(): void
    {
        [$participant, $payment] = $this->submitted();
        $this->actingAs($this->admin(), 'admin')->postJson("/api/admin/payments/{$payment->id}/reject", ['reason' => 'Amount mismatch'])->assertOk();
        $this->app['auth']->forgetGuards();

        $this->getJson("/api/registration/{$participant->public_token}")
            ->assertOk()
            ->assertJsonPath('data.can_pay', true)
            ->assertJsonPath('data.participant.status', 'reserved')
            ->assertJsonMissingPath('data.participant.email');

        $tx2 = $this->postJson('/api/payments/initiate', ['participant_token' => $participant->public_token, 'gateway' => 'bkash'])->assertCreated()->json('data.transaction_id');
        $this->postJson('/api/payments/submit', ['transaction_id' => $tx2, 'participant_token' => $participant->public_token, 'reference' => 'NEWTRX999'])->assertOk();

        // The rejected TrxID stays burned so it cannot be replayed by someone else.
        $other = Participant::factory()->create();
        $tx3 = $this->postJson('/api/payments/initiate', ['participant_token' => $other->public_token, 'gateway' => 'bkash'])->json('data.transaction_id');
        $this->postJson('/api/payments/submit', ['transaction_id' => $tx3, 'participant_token' => $other->public_token, 'reference' => 'TRX123ABC'])->assertStatus(409);
    }

    public function test_completed_payments_cannot_be_rejected(): void
    {
        [, $payment] = $this->submitted();
        $admin = $this->admin();
        $this->actingAs($admin, 'admin')->postJson("/api/admin/payments/{$payment->id}/approve")->assertOk();

        $this->actingAs($admin, 'admin')->postJson("/api/admin/payments/{$payment->id}/reject", ['reason' => 'Mistake'])->assertStatus(409);
    }

    public function test_review_endpoints_require_authentication(): void
    {
        $this->getJson('/api/admin/payments')->assertUnauthorized();
        $this->postJson('/api/admin/payments/1/approve')->assertUnauthorized();
        $this->postJson('/api/admin/payments/1/reject', ['reason' => 'x'])->assertUnauthorized();
    }

    public function test_resume_with_unknown_token_is_404(): void
    {
        $this->getJson('/api/registration/nope')->assertNotFound();
    }
}
