<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\PaymentException;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Manual payment review queue: runners send money and submit a TrxID; admins approve or reject. */
class PaymentReviewController extends Controller
{
    public function __construct(protected PaymentService $payments) {}

    /** GET /api/admin/payments?status=pending|completed|failed|all&search= */
    public function index(Request $request): JsonResponse
    {
        $status = $request->string('status', 'pending')->toString();
        $query = Payment::query()->with('participant:id,full_name,phone,email,category,status,bib_number');

        if ($status === 'pending') {
            // Awaiting review = the runner has submitted a TrxID.
            $query->where('status', Payment::STATUS_PENDING)->whereNotNull('submitted_reference');
        } elseif (in_array($status, [Payment::STATUS_COMPLETED, Payment::STATUS_FAILED], true)) {
            $query->where('status', $status);
        }

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('submitted_reference', 'like', "%{$search}%")
                    ->orWhere('transaction_id', 'like', "%{$search}%")
                    ->orWhereHas('participant', fn ($p) => $p->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        $order = $status === 'pending' ? 'asc' : 'desc';

        return response()->json(
            $query->orderBy('submitted_at', $order)->orderBy('id', $order)
                ->paginate(min(100, max(1, (int) $request->integer('per_page', 25))))
        );
    }

    /** POST /api/admin/payments/{payment}/approve */
    public function approve(Request $request, Payment $payment): JsonResponse
    {
        try {
            $payment = $this->payments->confirm(
                $payment,
                $payment->submitted_reference ?? 'ADMIN-VERIFIED',
                ['verified_by' => $request->user('admin')?->email],
            );
        } catch (PaymentException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
        }

        return response()->json(['data' => $payment->load('participant')]);
    }

    /** POST /api/admin/payments/{payment}/reject  { reason } */
    public function reject(Request $request, Payment $payment): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:200']]);

        try {
            $payment = $this->payments->reject($payment, $data['reason']);
        } catch (PaymentException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
        }

        return response()->json(['data' => $payment->load('participant')]);
    }
}
