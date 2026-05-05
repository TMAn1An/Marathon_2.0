<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateParticipantRequest;
use App\Models\Participant;
use App\Models\Payment;
use App\Services\BibService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ParticipantController extends Controller
{
    public function __construct(
        protected BibService $bibs,
        protected NotificationService $notifications,
    ) {}

    /**
     * GET /api/admin/participants
     * Paginated list with category/status/search filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Participant::query()->with('latestPayment');

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('university_id', 'like', "%{$search}%")
                    ->orWhere('bib_number', 'like', "%{$search}%");
            });
        }

        $perPage = min(100, max(1, (int) $request->integer('per_page', 25)));

        return response()->json($query->latest()->paginate($perPage));
    }

    public function show(Participant $participant): JsonResponse
    {
        $participant->load(['payments', 'certificate', 'notifications']);

        return response()->json([
            'data' => $participant,
        ]);
    }

    public function update(UpdateParticipantRequest $request, Participant $participant): JsonResponse
    {
        $participant->fill($request->validated());

        if ($request->status === Participant::STATUS_CONFIRMED && ! $participant->bib_number) {
            $participant->confirmed_at = $participant->confirmed_at ?? now();
            $participant->slot_reserved_until = null;
            $participant->save();
            $this->bibs->assign($participant);
            $participant->refresh();
        } else {
            $participant->save();
        }

        return response()->json([
            'data' => $participant,
        ]);
    }

    /**
     * POST /api/admin/participants/{participant}/verify-payment
     * Manual payment verification from the admin dashboard.
     */
    public function verifyPayment(Participant $participant): JsonResponse
    {
        $payment = $participant->payments()->where('status', Payment::STATUS_PENDING)->latest()->first();

        if (! $payment) {
            return response()->json([
                'message' => 'No pending payment found for this participant.',
            ], 404);
        }

        app(\App\Services\PaymentService::class)->confirm(
            $payment,
            'ADMIN-VERIFIED',
            ['verified_by' => optional(request()->user('admin'))->email]
        );

        return response()->json([
            'data' => $participant->fresh(['payments', 'certificate']),
        ]);
    }

    /**
     * GET /api/admin/participants/export
     * Streams the participant list as CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = Participant::query()->with('latestPayment');
        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $filename = 'participants-' . now()->format('Ymd-His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'BIB', 'Full Name', 'University ID', 'Category', 'Phone',
                'Email', 'Emergency Contact', 'T-shirt Size', 'Status',
                'Payment Status', 'Amount', 'Confirmed At',
            ]);

            $query->orderBy('id')->chunk(200, function ($rows) use ($out) {
                foreach ($rows as $p) {
                    $payment = $p->latestPayment;
                    fputcsv($out, [
                        $p->bib_number,
                        $p->full_name,
                        $p->university_id,
                        $p->category,
                        $p->phone,
                        $p->email,
                        $p->emergency_contact,
                        $p->tshirt_size,
                        $p->status,
                        $payment?->status,
                        $payment?->amount,
                        optional($p->confirmed_at)->toDateTimeString(),
                    ]);
                }
            });
            fclose($out);
        }, 200, $headers);
    }
}
