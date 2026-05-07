<?php

namespace App\Http\Controllers\Api\Public;

use App\Exceptions\PaymentException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ConfirmPaymentRequest;
use App\Http\Requests\Api\InitiatePaymentRequest;
use App\Models\Event;
use App\Models\Participant;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(protected PaymentService $payments) {}

    public function initiate(Event $event, InitiatePaymentRequest $request): JsonResponse
    {
        $participant = Participant::query()
            ->where('event_id', $event->id)
            ->findOrFail($request->validated()['participant_id']);

        try {
            $payment = $this->payments->initiate($participant, $request->validated()['gateway']);
        } catch (PaymentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'data' => [
                'transaction_id' => $payment->transaction_id,
                'amount' => $payment->amount,
                'gateway' => $payment->gateway,
                'participant' => $participant->fresh(),
            ],
        ], 201);
    }

    /**
     * POST /api/payments/confirm
     * Webhook-style endpoint the simulated gateway calls to finalise the
     * transaction. Accepts outcome=success|failure.
     */
    public function confirm(ConfirmPaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $payment = Payment::where('transaction_id', $data['transaction_id'])->firstOrFail();

        try {
            if ($data['outcome'] === 'success') {
                $payment = $this->payments->confirm(
                    $payment,
                    $data['gateway_reference'] ?? null,
                    [
                        'payer_phone' => $data['payer_phone'] ?? null,
                    ]
                );
            } else {
                $payment = $this->payments->fail($payment, 'User cancelled or gateway declined.');
            }
        } catch (PaymentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        $participant = $payment->participant;

        return response()->json([
            'data' => [
                'payment' => $payment,
                'participant' => $participant,
            ],
        ]);
    }

    /**
     * GET /api/payments/{transaction}
     * Allows the frontend to poll the current status of a transaction —
     * handy when the user refreshes during checkout.
     */
    public function show(string $transaction): JsonResponse
    {
        $payment = Payment::where('transaction_id', $transaction)
            ->with('participant')
            ->firstOrFail();

        return response()->json([
            'data' => $payment,
        ]);
    }
}
