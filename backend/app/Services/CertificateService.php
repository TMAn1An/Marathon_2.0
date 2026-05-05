<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Participant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificateService
{
    /**
     * Generates (or returns existing) certificate metadata for a participant.
     * The actual PDF is rendered on demand to keep the generated_at flag
     * accurate even if templates change later.
     */
    public function getOrCreate(Participant $participant): Certificate
    {
        if (! $participant->isConfirmed()) {
            throw new \RuntimeException('Certificates are only available for confirmed participants.');
        }

        return Certificate::firstOrCreate(
            ['participant_id' => $participant->id],
            ['generated_at' => now()],
        );
    }

    /**
     * Renders the participant's certificate PDF and returns the binary
     * blob. Embeds a verification QR code that resolves to the
     * configured public verify URL.
     */
    public function renderPdf(Participant $participant): string
    {
        $certificate = $this->getOrCreate($participant);

        $verifyUrl = str_replace(
            '{uuid}',
            $certificate->certificate_uuid,
            (string) config('marathon.verification.url_template'),
        );

        $qrSvg = QrCode::format('svg')->size(160)->margin(0)->generate($verifyUrl);
        $qrDataUri = 'data:image/svg+xml;base64,' . base64_encode($qrSvg);

        $pdf = Pdf::loadView('certificates.default', [
            'participant' => $participant,
            'certificate' => $certificate,
            'verifyUrl' => $verifyUrl,
            'qrDataUri' => $qrDataUri,
            'event' => config('marathon.event'),
        ])->setPaper('a4', 'landscape');

        $certificate->increment('download_count');
        if (! $certificate->generated_at) {
            $certificate->update(['generated_at' => now()]);
        }

        return $pdf->output();
    }

    /**
     * Looks up a confirmed participant by phone or BIB number for the
     * public certificate download endpoint. Returns null when not found.
     */
    public function findEligible(string $query): ?Participant
    {
        $query = trim($query);
        if ($query === '') {
            return null;
        }

        return Participant::query()
            ->where('status', Participant::STATUS_CONFIRMED)
            ->where(function ($q) use ($query) {
                $q->where('phone', $query)
                    ->orWhere('bib_number', $query);
            })
            ->first();
    }

    /**
     * Verifies a certificate by UUID. Returns the participant if valid.
     */
    public function verify(string $uuid): ?Participant
    {
        $certificate = Certificate::query()
            ->where('certificate_uuid', $uuid)
            ->with('participant')
            ->first();

        return $certificate?->participant;
    }
}
