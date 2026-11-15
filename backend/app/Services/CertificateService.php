<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Participant;
use Barryvdh\DomPDF\Facade\Pdf;
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
        if (! $this->isEligible($participant)) {
            throw new \RuntimeException('This participant is not eligible for a certificate.');
        }

        return Certificate::firstOrCreate(
            ['participant_id' => $participant->id],
            ['generated_at' => now()],
        );
    }

    /** Confirmed runners, and — by default — only those with a recorded finish. */
    public function isEligible(Participant $participant): bool
    {
        if (! $participant->isConfirmed()) {
            return false;
        }

        return ! config('marathon.certificates.require_finish')
            || $participant->finish_time_seconds !== null;
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
        $qrDataUri = 'data:image/svg+xml;base64,'.base64_encode($qrSvg);

        $pdf = Pdf::loadView('certificates.default', [
            'participant' => $participant,
            'certificate' => $certificate,
            'verifyUrl' => $verifyUrl,
            'qrDataUri' => $qrDataUri,
            'event' => config('marathon.event'),
            'finishTime' => $participant->finish_time,
            'rank' => app(ResultsService::class)->rankOf($participant),
        ])->setPaper('a4', 'landscape');

        $certificate->increment('download_count');
        if (! $certificate->generated_at) {
            $certificate->update(['generated_at' => now()]);
        }

        return $pdf->output();
    }

    /**
     * Finds an eligible runner by BIB *and* phone number. Requiring both
     * stops anyone enumerating sequential BIBs to pull other people's
     * certificates.
     */
    public function findEligible(string $bib, string $phone): ?Participant
    {
        $bib = strtoupper(trim($bib));
        $phone = preg_replace('/[\s\-]+/', '', $phone);
        if ($bib === '' || $phone === '') {
            return null;
        }

        $participant = Participant::query()
            ->where('status', Participant::STATUS_CONFIRMED)
            ->where('bib_number', $bib)
            ->where('phone', $phone)
            ->first();

        return $participant && $this->isEligible($participant) ? $participant : null;
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
