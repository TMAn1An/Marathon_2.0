<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BulkNotificationRequest;
use App\Models\Participant;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(protected NotificationService $notifications) {}

    /**
     * POST /api/admin/notifications/bulk
     * Sends a mock bulk notification (email or SMS) to all participants
     * matching the supplied filters.
     */
    public function bulk(BulkNotificationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $query = Participant::query();

        if (! empty($data['category'])) {
            $query->where('category', $data['category']);
        }
        if (! empty($data['status'])) {
            $query->where('status', $data['status']);
        } else {
            $query->where('status', Participant::STATUS_CONFIRMED);
        }

        $count = $this->notifications->sendBulk(
            $query->get(),
            $data['subject'] ?? '',
            $data['body'],
            $data['channel'],
        );

        return response()->json([
            'message' => "Notification queued for {$count} recipient(s).",
            'data' => [
                'recipients' => $count,
                'channel' => $data['channel'],
            ],
        ]);
    }
}
