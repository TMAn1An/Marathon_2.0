<?php

namespace App\Services;

use App\Exceptions\PaymentException;
use App\Models\Participant;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        protected BibService $bibService,
        protected NotificationService $notificationService,
    ) {}

    /**
     * Calculates the registration fee for a participant.
     */
    public function calculateFee(Participant $participant): int
    {
        $event = $participant->event ?? \App\Models\Event::query()->find($participant->event_id);
        if (! $event) {
            return (int) config('marathon.event_defaults.student_fee_bdt');
        }

        return match ($participant->category) {
            Participant::CATEGORY_FACULTY => $event->faculty_fee_bdt,
            Participant::CATEGORY_GUEST => 0,
            default => $event->student_fee_bdt,
        };
    }

    /**
     * Initiates a payment transaction for a participant. Validates that the
     * slot is still held and not already confirmed. Returns the Payment
     * record (in pending status) which represents the simulated checkout
     * session.
     */
    public function initiate(Participant $participant, string $gateway = 'bkash'): Payment
    {
        if ($participant->status === Participant::STATUS_CONFIRMED) {
            throw new PaymentException('This registration is already confirmed.', 409);
        }

        if (! $participant->reservationActive()) {
            throw new PaymentException(
                'Your slot reservation has expired. Please register again.',
                410
            );
        }

        return DB::transaction(function () use ($participant, $gateway) {
            $participant->status = Participant::STATUS_PENDING_PAYMENT;
            $participant->save();

            return Payment::create([
                'participant_id' => $participant->id,
                'transaction_id' => $this->generateTransactionId($gateway),
                'amount' => $this->calculateFee($participant),
                'gateway' => $gateway,
                'status' => Payment::STATUS_PENDING,
                'payer_phone' => $participant->phone,
            ]);
        });
    }

    /**
     * Marks a pending payment as successful, confirms the participant,
     * assigns a BIB number, and triggers notifications. Idempotent on
     * already-completed payments.
     */
    public function confirm(Payment $payment, ?string $gatewayReference = null, array $gatewayResponse = []): Payment
    {
        if ($payment->status === Payment::STATUS_COMPLETED) {
            return $payment;
        }

        if ($payment->status === Payment::STATUS_FAILED) {
            throw new PaymentException('This payment has already failed and cannot be confirmed.', 409);
        }

        return DB::transaction(function () use ($payment, $gatewayReference, $gatewayResponse) {
            $payment->refresh();
            $participant = $payment->participant()->lockForUpdate()->first();

            $payment->update([
                'status' => Payment::STATUS_COMPLETED,
                'gateway_reference' => $gatewayReference ?? Str::upper(Str::random(12)),
                'gateway_response' => $gatewayResponse,
                'paid_at' => now(),
            ]);

            $participant->status = Participant::STATUS_CONFIRMED;
            $participant->confirmed_at = now();
            $participant->slot_reserved_until = null;
            $participant->save();

            // Assign BIB only after successful payment per spec.
            $this->bibService->assign($participant);
            $participant->refresh();

            $this->notificationService->sendRegistrationConfirmation($participant);

            return $payment->fresh('participant');
        });
    }

    /**
     * Marks a pending payment as failed, releases the reservation hold
     * so the slot can be reused. Idempotent.
     */
    public function fail(Payment $payment, string $reason = 'Payment was not completed'): Payment
    {
        if ($payment->status === Payment::STATUS_FAILED) {
            return $payment;
        }

        if ($payment->status === Payment::STATUS_COMPLETED) {
            throw new PaymentException('This payment is already completed.', 409);
        }

        return DB::transaction(function () use ($payment, $reason) {
            $payment->update([
                'status' => Payment::STATUS_FAILED,
                'failed_at' => now(),
                'failure_reason' => $reason,
            ]);

            $participant = $payment->participant()->lockForUpdate()->first();
            // Slot stays held until expiry so a quick retry is possible,
            // but if the user explicitly failed we move them back to reserved.
            if ($participant && $participant->status === Participant::STATUS_PENDING_PAYMENT) {
                $participant->status = Participant::STATUS_RESERVED;
                $participant->save();
            }

            return $payment->fresh();
        });
    }

    protected function generateTransactionId(string $gateway): string
    {
        $prefix = strtoupper(substr($gateway, 0, 3));

        return $prefix . '-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(8));
    }
}
