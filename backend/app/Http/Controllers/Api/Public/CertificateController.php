<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CertificateController extends Controller
{
    public function __construct(protected CertificateService $certificates) {}

    /**
     * GET /api/certificates/lookup?query=...
     * Confirms whether a certificate is available for a phone or BIB number.
     */
    public function lookup(Request $request): JsonResponse
    {
        $request->validate([
            'query' => ['required', 'string', 'max:50'],
        ]);

        $participant = $this->certificates->findEligible($request->string('query'));

        if (! $participant) {
            return response()->json([
                'message' => 'No confirmed registration found for that phone number or BIB.',
            ], 404);
        }

        $certificate = $this->certificates->getOrCreate($participant);

        return response()->json([
            'data' => [
                'participant' => [
                    'id' => $participant->id,
                    'full_name' => $participant->full_name,
                    'bib_number' => $participant->bib_number,
                    'category' => $participant->category,
                ],
                'certificate_uuid' => $certificate->certificate_uuid,
            ],
        ]);
    }

    /**
     * GET /api/certificates/{uuid}/download
     * Streams the rendered PDF certificate to the requester.
     */
    public function download(string $uuid): Response
    {
        $participant = $this->certificates->verify($uuid);
        if (! $participant) {
            abort(404, 'Certificate not found.');
        }

        $pdf = $this->certificates->renderPdf($participant);
        $filename = 'iubat-marathon-certificate-' . ($participant->bib_number ?? $participant->id) . '.pdf';

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * GET /api/certificates/{uuid}/verify
     * Public verification endpoint linked from the QR code on the
     * certificate. Returns participant summary only (no contact details).
     */
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
                'event' => config('marathon.event.name'),
                'event_date' => config('marathon.event.date'),
            ],
        ]);
    }
}
