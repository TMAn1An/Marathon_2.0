<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $event?->title ?? $platformName }} — Certificate of Participation</title>
    <style>
        @page { size: A4 landscape; margin: 0; }
        * { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            width: 297mm;
            height: 210mm;
            font-family: 'DejaVu Sans', sans-serif;
            color: #1f2937;
            background: #ffffff;
        }

        .frame {
            position: absolute;
            top: 6mm;
            left: 6mm;
            width: 285mm;
            height: 198mm;
            border: 2.6mm solid {{ $template->primary_color ?? '#ED1C24' }};
        }
        .frame-accent {
            position: absolute;
            top: 9.4mm;
            left: 9.4mm;
            width: 278.2mm;
            height: 191.2mm;
            border: 0.5mm solid {{ $template->primary_color ?? '#ED1C24' }};
            opacity: 0.55;
        }

        .corner {
            position: absolute;
            width: 36mm;
            height: 36mm;
            border: 0.6mm solid {{ $template->primary_color ?? '#ED1C24' }};
            opacity: 0.35;
        }
        .corner.tl { top: 14mm; left: 14mm; border-right: none; border-bottom: none; }
        .corner.tr { top: 14mm; right: 14mm; border-left: none; border-bottom: none; }
        .corner.bl { bottom: 14mm; left: 14mm; border-right: none; border-top: none; }
        .corner.br { bottom: 14mm; right: 14mm; border-left: none; border-top: none; }

        .ribbon {
            position: absolute;
            top: 4mm;
            left: 50%;
            margin-left: -55mm;
            width: 110mm;
            background: {{ $template->primary_color ?? '#ED1C24' }};
            color: #ffffff;
            font-size: 9pt;
            letter-spacing: 4pt;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
            padding: 3pt 0;
        }

        .institution {
            position: absolute;
            top: 22mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: {{ $template->primary_color ?? '#ED1C24' }};
            font-size: 10pt;
            letter-spacing: 5pt;
            font-weight: 700;
            text-transform: uppercase;
        }

        .title {
            position: absolute;
            top: 32mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: #111827;
            font-size: 32pt;
            font-weight: 800;
            letter-spacing: 1pt;
            line-height: 1;
            margin: 0;
        }
        .title-rule {
            position: absolute;
            top: 53mm;
            left: 50%;
            margin-left: -28mm;
            width: 56mm;
            height: 0.7mm;
            background: {{ $template->primary_color ?? '#ED1C24' }};
        }

        .preface {
            position: absolute;
            top: 60mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: #4b5563;
            font-size: 12pt;
            margin: 0;
        }

        .name {
            position: absolute;
            top: 72mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: #111827;
            font-size: 38pt;
            font-weight: 800;
            line-height: 1.1;
        }
        .name-text {
            display: inline-block;
            border-bottom: 0.6pt solid #cbd5e1;
            padding: 0 8mm 1.5mm;
        }

        .description {
            position: absolute;
            top: 100mm;
            left: 30mm;
            width: 237mm;
            text-align: center;
            color: #374151;
            font-size: 11pt;
            line-height: 1.55;
        }
        .description strong { color: {{ $template->primary_color ?? '#ED1C24' }}; }

        /* Metadata strip implemented with flex (DOMPDF-compatible). */
        .meta {
            position: absolute;
            top: 130mm;
            left: 30mm;
            width: 237mm;
            display: flex;
            flex-direction: row;
            justify-content: center;
        }
        .meta-cell {
            flex: 1;
            text-align: center;
            border-left: 0.5pt solid #e5e7eb;
            padding: 0 4mm;
        }
        .meta-cell:first-child { border-left: none; }
        .meta-label {
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 1.5pt;
            color: #6b7280;
            display: block;
            margin-bottom: 1.2mm;
        }
        .meta-value {
            font-size: 14pt;
            font-weight: 700;
            color: #111827;
        }
        .meta-value.bib { color: {{ $template->primary_color ?? '#ED1C24' }}; letter-spacing: 0.8pt; }

        .footer {
            position: absolute;
            top: 174mm;
            left: 18mm;
            width: 261mm;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
        }
        .sig {
            width: 35%;
            text-align: center;
            color: #374151;
            font-size: 10pt;
        }
        .sig img {
            display: block;
            margin: 0 auto 1mm;
            max-height: 14mm;
        }
        .sig-line {
            border-top: 0.5pt solid #9ca3af;
            margin: 0 8mm 1.5mm;
            padding-top: 1.2mm;
        }
        .sig-name { font-weight: 700; color: #111827; }
        .sig-role { font-size: 9pt; color: #6b7280; }

        .qr {
            text-align: center;
            color: #6b7280;
            font-size: 8pt;
        }
        .qr img { width: 22mm; height: 22mm; display: block; margin: 0 auto 1mm; }

        .footer-meta {
            position: absolute;
            bottom: 8mm;
            left: 18mm;
            width: 261mm;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            font-size: 8pt;
            color: #9ca3af;
            letter-spacing: 0.5pt;
        }
    </style>
</head>
<body>
    <div class="frame"></div>
    <div class="frame-accent"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <div class="ribbon">{{ $platformName }}</div>
    <div class="institution">{{ config('marathon.platform.organizer') }}</div>

    <h1 class="title">Certificate of Participation</h1>
    <div class="title-rule"></div>

    <p class="preface">This certificate is proudly presented to</p>

    <div class="name">
        <span class="name-text">{{ $participant->full_name }}</span>
    </div>

    <div class="description">
        for completing the <strong>{{ $event?->title ?? $platformName }}</strong>
        @if ($event?->event_start_date)
            held on {{ $event->event_start_date->format('F j, Y') }}
        @endif
        @if ($event?->location)
            at <strong>{{ $event->location }}</strong>
        @endif.
    </div>

    <div class="meta">
        <div class="meta-cell">
            <span class="meta-label">BIB Number</span>
            <span class="meta-value bib">{{ $participant->bib_number ?: '—' }}</span>
        </div>
        <div class="meta-cell">
            <span class="meta-label">Category</span>
            <span class="meta-value">{{ ucfirst($participant->category) }}</span>
        </div>
        @if ($participant->chip_time)
        <div class="meta-cell">
            <span class="meta-label">Chip Time</span>
            <span class="meta-value">{{ $participant->chip_time }}</span>
        </div>
        @endif
        @if ($participant->overall_place)
        <div class="meta-cell">
            <span class="meta-label">Overall Rank</span>
            <span class="meta-value">#{{ $participant->overall_place }}</span>
        </div>
        @endif
        @if ($participant->gender_place)
        <div class="meta-cell">
            <span class="meta-label">{{ ucfirst($participant->gender ?? 'Gender') }} Rank</span>
            <span class="meta-value">#{{ $participant->gender_place }}</span>
        </div>
        @endif
    </div>

    <div class="footer">
        <div class="sig">
            @if (! empty($signature1['dataUri']))
                <img src="{{ $signature1['dataUri'] }}" alt="">
            @endif
            <div class="sig-line"></div>
            @if ($signature1['name'])
                <div class="sig-name">{{ $signature1['name'] }}</div>
            @endif
            @if ($signature1['designation'])
                <div class="sig-role">{{ $signature1['designation'] }}</div>
            @endif
        </div>

        <div class="qr">
            <img src="{{ $qrDataUri }}" alt="">
            <div>Verify · {{ $certificate->certificate_uuid }}</div>
        </div>

        <div class="sig">
            @if (! empty($signature2['dataUri']))
                <img src="{{ $signature2['dataUri'] }}" alt="">
            @endif
            <div class="sig-line"></div>
            @if ($signature2['name'])
                <div class="sig-name">{{ $signature2['name'] }}</div>
            @endif
            @if ($signature2['designation'])
                <div class="sig-role">{{ $signature2['designation'] }}</div>
            @endif
        </div>
    </div>

    <div class="footer-meta">
        <span>Issued {{ optional($certificate->generated_at)->format('F j, Y') ?: now()->format('F j, Y') }}</span>
        <span>{{ $verifyUrl }}</span>
    </div>
</body>
</html>
