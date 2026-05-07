<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\RegistrationException;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\BibService;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GuestParticipantController extends Controller
{
    public function __construct(
        protected RegistrationService $registration,
        protected BibService $bibs,
    ) {}

    public function store(Event $event, Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
            'email' => ['required', 'email', 'max:191'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'department' => ['nullable', 'string', 'max:120'],
            'tshirt_size' => ['required', Rule::in(['XS', 'S', 'M', 'L', 'XL', 'XXL'])],
            'emergency_contact' => ['nullable', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
            'university_id' => ['nullable', 'string', 'max:50'],
        ]);

        try {
            $participant = $this->registration->createGuestParticipant($event, $data);
            $this->bibs->assign($participant);
            $participant->refresh();
        } catch (RegistrationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json(['data' => $participant], 201);
    }
}
