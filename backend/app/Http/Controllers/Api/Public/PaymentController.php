<?php

namespace App\Http\Controllers\Api\Public;

use App\Exceptions\PaymentException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ConfirmPaymentRequest;
use App\Http\Requests\Api\InitiatePaymentRequest;
use App\Http\Requests\Api\SubmitPaymentReferenceRequest;
use App\Models\Participant;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(protected PaymentService $payments) {}

    /** GET /api/payments/config — how the checkout should behave. */
    public function config(): JsonResponse
    {
        return response()->json(['data' => $this->checkoutConfig()]);
    }

    /**
     * POST /api/payments/initiate
     * Creates a pending payment for a reserved participant.
     */
    public function initiate(InitiatePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $participant = Participant::where('public_token', $data['participant_token'])->firstOrFail();

        try {
            $payment = $this->payments->initiate($participant, $data['gateway']);
        } catch (PaymentException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
        }

        return response()->json([
            'data' => $this->paymentPayload($payment->setRelation('participant', $participant->fresh())),
        ], 201);
    }

    /**
     * POST /api/payments/submit
     * Manual flow: the runner reports the bKash/Nagad TrxID they paid with.
     */
    public function submit(SubmitPaymentReferenceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $payment = $this->ownedPayment($data['transaction_id'], $data['participant_token']);

        try {
            $payment = $this->payments->submitReference(
                $payment,
                $data['reference'],
                $data['payer_phone'] ?? null,
            );
        } catch (PaymentException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
        }

        return response()->json(['data' => $this->paymentPayload($payment)]);
    }

    /**
     * POST /api/payments/confirm
     * Demo-only: the simulated gateway finalises its own transaction. Anyone
     * could call this, so it is unavailable outside simulated mode and is
     * never allowed in production.
     */
    public function confirm(ConfirmPaymentRequest $request): JsonResponse
    {
        if (! $this->simulatedEnabled()) {
            abort(404);
        }

        $data = $request->validated();
        $payment = $this->ownedPayment($data['transaction_id'], $data['participant_token']);

        try {
            $payment = $data['outcome'] === 'success'
                ? $this->payments->confirm($payment, 'SIM-'.strtoupper(substr(md5((string) microtime(true)), 0, 10)))
                : $this->payments->fail($payment, 'User cancelled or gateway declined.');
        } catch (PaymentException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
        }

        return response()->json(['data' => $this->paymentPayload($payment)]);
    }

    /**
     * GET /api/payments/{transaction}?token=…
     * Lets the checkout page resume after a refresh. The participant token
     * proves ownership; no contact details are returned.
     */
    public function show(Request $request, string $transaction): JsonResponse
    {
        $payment = $this->ownedPayment($transaction, (string) $request->query('token'));

        return response()->json(['data' => $this->paymentPayload($payment)]);
    }

    protected function ownedPayment(string $transactionId, string $token): Payment
    {
        $payment = Payment::where('transaction_id', $transactionId)->with('participant')->firstOrFail();
        abort_unless(
            $payment->participant && hash_equals((string) $payment->participant->public_token, $token),
            404
        );

        return $payment;
    }

    protected function simulatedEnabled(): bool
    {
        return config('marathon.payments.mode') === 'simulated' && ! app()->isProduction();
    }

    protected function checkoutConfig(): array
    {
        return [
            'mode' => $this->simulatedEnabled() ? 'simulated' : 'manual',
            'merchant' => config('marathon.payments.merchant'),
            'hold_minutes' => (int) config('marathon.slots.hold_minutes'),
            'verification_hold_hours' => (int) config('marathon.payments.verification_hold_hours'),
        ];
    }

    protected function paymentPayload(Payment $payment): array
    {
        $participant = $payment->participant;

        return [
            'transaction_id' => $payment->transaction_id,
            'amount' => (float) $payment->amount,
            'gateway' => $payment->gateway,
            'status' => $payment->status,
            'submitted_reference' => $payment->submitted_reference,
            'participant' => $participant?->publicSummary(),
            'hold_expires_at' => $participant?->slot_reserved_until?->toIso8601String(),
            'checkout' => $this->checkoutConfig(),
        ];
    }
}
