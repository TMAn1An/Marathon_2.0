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
     * GET /api/certificates/lookup?bib=…&phone=…
     * Confirms whether a certificate is available for this runner.
     */
    public function lookup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bib' => ['required', 'string', 'max:20'],
            'phone' => ['required', 'string', 'max:32'],
        ]);

        $participant = $this->certificates->findEligible($data['bib'], $data['phone']);

        if (! $participant) {
            return response()->json([
                'message' => 'No certificate found. Check your BIB and phone number, and note that certificates open once results are published.',
            ], 404);
        }

        $certificate = $this->certificates->getOrCreate($participant);

        return response()->json([
            'data' => [
                'participant' => [
                    'full_name' => $participant->full_name,
                    'bib_number' => $participant->bib_number,
                    'category' => $participant->category,
                    'finish_time' => $participant->finish_time,
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
        $filename = 'iubat-marathon-certificate-'.($participant->bib_number ?? $participant->id).'.pdf';

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
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
                'finish_time' => $participant->finish_time,
            ],
        ]);
    }
}
