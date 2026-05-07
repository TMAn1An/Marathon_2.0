<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class CertificateController extends Controller
{
    public function __construct(protected CertificateService $certificates) {}

    public function lookup(Request $request): JsonResponse
    {
        $request->validate([
            'query' => ['required', 'string', 'max:50'],
            'event_id' => ['nullable', 'integer'],
        ]);

        $participant = $this->certificates->findEligible(
            $request->string('query'),
            $request->integer('event_id') ?: null,
        );

        if (! $participant) {
            return response()->json([
                'message' => 'No confirmed registration found for that phone number or BIB.',
            ], 404);
        }

        try {
            $certificate = $this->certificates->getOrCreate($participant);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 423);
        }

        return response()->json([
            'data' => [
                'participant' => [
                    'id' => $participant->id,
                    'full_name' => $participant->full_name,
                    'bib_number' => $participant->bib_number,
                    'category' => $participant->category,
                ],
                'event' => $participant->event ? [
                    'title' => $participant->event->title,
                    'slug' => $participant->event->slug,
                    'event_date' => $participant->event->event_date?->toIso8601String(),
                    'status' => $participant->event->status,
                ] : null,
                'certificate_uuid' => $certificate->certificate_uuid,
            ],
        ]);
    }

    public function download(string $uuid): Response
    {
        $participant = $this->certificates->verify($uuid);
        if (! $participant) {
            abort(404, 'Certificate not found.');
        }

        try {
            $pdf = $this->certificates->renderPdf($participant);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 423);
        }

        $filename = 'iubat-scse-marathon-certificate-'
            .($participant->bib_number ?? $participant->id).'.pdf';

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function verify(string $uuid): JsonResponse
    {
        $participant = $this->certificates->verify($uuid);
        if (! $participant) {
            return response()->json([
                'valid' => false,
                'message' => 'Certificate not found.',
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'data' => [
                'full_name' => $participant->full_name,
                'bib_number' => $participant->bib_number,
                'category' => $participant->category,
                'event' => $participant->event?->title,
                'event_date' => $participant->event?->event_date?->toIso8601String(),
            ],
        ]);
    }
}
