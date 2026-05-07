<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\Event;
use App\Models\Participant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificateService
{
    /**
     * Per-spec: certificates are downloadable ONLY when the event is past.
     */
    public function assertDownloadable(Participant $participant): void
    {
        if (! $participant->isConfirmed()) {
            throw new RuntimeException('Certificates are only available for confirmed participants.');
        }

        $event = $participant->event ?? Event::query()->find($participant->event_id);
        if (! $event || ! $event->isPast()) {
            throw new RuntimeException('Certificates unlock once the event finishes. Please check back later.');
        }
    }

    public function getOrCreate(Participant $participant): Certificate
    {
        $this->assertDownloadable($participant);

        return Certificate::firstOrCreate(
            ['participant_id' => $participant->id],
            ['generated_at' => now()],
        );
    }

    public function renderPdf(Participant $participant): string
    {
        $certificate = $this->getOrCreate($participant);
        $event = $participant->event ?? Event::query()->find($participant->event_id);

        $template = $event?->certificateTemplate ?? new CertificateTemplate([
            'event_id' => $event?->id,
            'primary_color' => '#ED1C24',
        ]);

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
            'event' => $event,
            'template' => $template,
            'signature1' => $this->signaturePayload($template, 1),
            'signature2' => $this->signaturePayload($template, 2),
            'verifyUrl' => $verifyUrl,
            'qrDataUri' => $qrDataUri,
            'platformName' => config('marathon.platform.name'),
        ])->setPaper('a4', 'landscape');

        $certificate->increment('download_count');
        if (! $certificate->generated_at) {
            $certificate->update(['generated_at' => now()]);
        }

        return $pdf->output();
    }

    public function findEligible(string $query, ?int $eventId = null): ?Participant
    {
        $query = trim($query);
        if ($query === '') {
            return null;
        }

        $builder = Participant::query()
            ->with('event')
            ->where('status', Participant::STATUS_CONFIRMED)
            ->where(function ($q) use ($query) {
                $q->where('phone', $query)
                    ->orWhere('bib_number', $query);
            });

        if ($eventId) {
            $builder->where('event_id', $eventId);
        }

        return $builder->first();
    }

    public function verify(string $uuid): ?Participant
    {
        $certificate = Certificate::query()
            ->where('certificate_uuid', $uuid)
            ->with('participant.event')
            ->first();

        return $certificate?->participant;
    }

    /**
     * @return array{path: ?string, name: ?string, designation: ?string, dataUri: ?string}
     */
    protected function signaturePayload(CertificateTemplate $template, int $index): array
    {
        $pathField = "signature_{$index}_path";
        $nameField = "signature_{$index}_name";
        $designationField = "signature_{$index}_designation";

        $path = $template->{$pathField} ?? null;
        $dataUri = null;
        if ($path && Storage::disk('public')->exists($path)) {
            $abs = Storage::disk('public')->path($path);
            $mime = mime_content_type($abs) ?: 'image/png';
            $dataUri = 'data:'.$mime.';base64,'.base64_encode(file_get_contents($abs));
        }

        return [
            'path' => $path,
            'name' => $template->{$nameField} ?? null,
            'designation' => $template->{$designationField} ?? null,
            'dataUri' => $dataUri,
        ];
    }
}
