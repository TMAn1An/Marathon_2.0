<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\Payment;
use App\Services\SlotService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(protected SlotService $slots) {}

    /**
     * GET /api/admin/dashboard
     * Aggregate KPIs for the admin home screen.
     */
    public function stats(): JsonResponse
    {
        $confirmed = Participant::where('status', Participant::STATUS_CONFIRMED)->count();
        $pending = Participant::whereIn('status', [
            Participant::STATUS_RESERVED,
            Participant::STATUS_PENDING_PAYMENT,
        ])->count();
        $cancelled = Participant::where('status', Participant::STATUS_CANCELLED)->count();

        $byCategory = Participant::query()
            ->where('status', Participant::STATUS_CONFIRMED)
            ->selectRaw('category, COUNT(*) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        $payments = Payment::query()
            ->selectRaw('status, COUNT(*) as total, COALESCE(SUM(amount), 0) as amount')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return response()->json([
            'data' => [
                'slots' => $this->slots->summary(),
                'participants' => [
                    'confirmed' => $confirmed,
                    'pending' => $pending,
                    'cancelled' => $cancelled,
                    'by_category' => [
                        'student' => (int) ($byCategory['student'] ?? 0),
                        'faculty' => (int) ($byCategory['faculty'] ?? 0),
                    ],
                ],
                'payments' => [
                    'completed_count' => (int) ($payments['completed']->total ?? 0),
                    'completed_amount' => (float) ($payments['completed']->amount ?? 0),
                    'pending_count' => (int) ($payments['pending']->total ?? 0),
                    'failed_count' => (int) ($payments['failed']->total ?? 0),
                ],
            ],
        ]);
    }
}
