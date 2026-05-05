<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $event['name'] ?? 'IUBAT CSE 10K Marathon' }} — Certificate of Participation</title>
    <style>
        /* A4 landscape with zero @page margin gives us a fixed 297 x 210 mm
           printable canvas. Everything below is positioned with absolute
           coordinates so dompdf never reflows content onto a second page. */
        @page { size: A4 landscape; margin: 0; }
        * { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            width: 297mm;
            height: 210mm;
            font-family: 'DejaVu Sans', sans-serif;
            color: #0f5b32;
            background: #ffffff;
        }

        /* Decorative frame: drawn as solid borders on a div that sits ~6mm
           inside the page edge so the printer never clips it. */
        .frame {
            position: absolute;
            top: 6mm;
            left: 6mm;
            width: 285mm;
            height: 198mm;
            border: 3mm solid #0e4a2c;
            box-shadow: none;
        }
        .frame::before {
            /* dompdf supports limited pseudo-elements but background colour
               on a wrapper div works well enough as the inner accent line. */
            content: '';
        }
        .frame-accent {
            position: absolute;
            top: 9mm;
            left: 9mm;
            width: 279mm;
            height: 192mm;
            border: 0.6mm solid #f99c07;
        }

        .ribbon {
            position: absolute;
            top: 4mm;
            left: 50%;
            margin-left: -50mm;
            width: 100mm;
            background: #f96015;
            color: #ffffff;
            font-size: 9pt;
            letter-spacing: 3pt;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
            padding: 3pt 0;
        }

        .institution {
            position: absolute;
            top: 24mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: #0d723c;
            font-size: 11pt;
            letter-spacing: 5pt;
            font-weight: 700;
            text-transform: uppercase;
        }

        .title {
            position: absolute;
            top: 36mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: #0e4a2c;
            font-size: 30pt;
            font-weight: 800;
            letter-spacing: 0.5pt;
            line-height: 1;
            margin: 0;
        }

        .title-rule {
            position: absolute;
            top: 56mm;
            left: 50%;
            margin-left: -28mm;
            width: 56mm;
            height: 0.7mm;
            background: #f99c07;
        }

        .preface {
            position: absolute;
            top: 64mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: #1f2937;
            font-size: 12pt;
            margin: 0;
        }

        .name {
            position: absolute;
            top: 76mm;
            left: 0;
            width: 297mm;
            text-align: center;
            color: #0e4a2c;
            font-size: 36pt;
            font-weight: 800;
            line-height: 1.1;
        }
        .name-text {
            display: inline-block;
            border-bottom: 0.6pt solid #cbd5e1;
            padding: 0 6mm 1.5mm;
        }

        .description {
            position: absolute;
            top: 102mm;
            left: 30mm;
            width: 237mm;
            text-align: center;
            color: #1f2937;
            font-size: 11pt;
            line-height: 1.5;
        }
        .description strong { color: #0e4a2c; }

        .meta {
            position: absolute;
            top: 130mm;
            left: 30mm;
            width: 237mm;
            border-collapse: collapse;
        }
        .meta td {
            padding: 0 4mm;
            text-align: center;
            border-left: 0.5pt solid #d1d5db;
            vertical-align: top;
        }
        .meta td:first-child { border-left: none; }
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
            color: #0e4a2c;
        }
        .meta-value.bib {
            color: #c1370c;
            letter-spacing: 0.8pt;
        }

        .footer {
            position: absolute;
            top: 178mm;
            left: 18mm;
            width: 261mm;
            border-collapse: collapse;
        }
        .footer td { vertical-align: bottom; }
        .footer .sig { width: 35%; text-align: center; }
        .footer .spacer { width: 10%; }
        .footer .qr-cell { width: 20%; text-align: right; }
        .signature-line {
            border-top: 0.5pt solid #6b7280;
            margin: 0 6mm;
            padding-top: 1mm;
            color: #374151;
            font-size: 9.5pt;
            font-weight: 600;
        }
        .signature-role {
            color: #6b7280;
            font-size: 7.5pt;
            margin-top: 0.4mm;
        }

        .qr {
            position: absolute;
            top: 168mm;
            right: 18mm;
            text-align: right;
            width: 36mm;
        }
        .qr img {
            width: 22mm;
            height: 22mm;
            border: 0.4mm solid #d1d5db;
            padding: 0.7mm;
            background: #ffffff;
        }
        .qr-caption {
            font-size: 6.5pt;
            color: #6b7280;
            margin-top: 1mm;
            word-break: break-all;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="frame"></div>
    <div class="frame-accent"></div>

    <div class="ribbon">{{ $event['organizer'] ?? 'IUBAT · CSE Department' }}</div>

    <div class="institution">{{ $event['name'] ?? 'IUBAT CSE 10K Marathon' }}</div>

    <h1 class="title">Certificate of Participation</h1>
    <div class="title-rule"></div>

    <p class="preface">This is to certify that</p>

    <div class="name">
        <span class="name-text">{{ $participant->full_name }}</span>
    </div>

    <p class="description">
        successfully participated in the
        <strong>{{ $event['name'] ?? 'IUBAT CSE 10K Marathon' }}</strong>
        held on <strong>{{ $event['date'] ?? '' }}</strong>
        at <strong>{{ $event['venue'] ?? 'IUBAT Main Campus, Uttara, Dhaka' }}</strong>,
        completing the 10&nbsp;kilometre course in the
        {{ ucfirst($participant->category) }} category.
    </p>

    <table class="meta">
        <tr>
            <td>
                <span class="meta-label">BIB Number</span>
                <span class="meta-value bib">{{ $participant->bib_number }}</span>
            </td>
            <td>
                <span class="meta-label">Category</span>
                <span class="meta-value">{{ ucfirst($participant->category) }}</span>
            </td>
            @if (!empty($participant->finish_time))
                <td>
                    <span class="meta-label">Finish Time</span>
                    <span class="meta-value">{{ $participant->finish_time }}</span>
                </td>
            @endif
            @if (!empty($participant->rank))
                <td>
                    <span class="meta-label">Rank</span>
                    <span class="meta-value">#{{ $participant->rank }}</span>
                </td>
            @endif
            <td>
                <span class="meta-label">Event Date</span>
                <span class="meta-value">{{ $event['date'] ?? '' }}</span>
            </td>
        </tr>
    </table>

    <table class="footer">
        <tr>
            <td class="sig">
                <div class="signature-line">Race Director</div>
                <div class="signature-role">IUBAT CSE 10K Marathon</div>
            </td>
            <td class="spacer">&nbsp;</td>
            <td class="sig">
                <div class="signature-line">Head, CSE Department</div>
                <div class="signature-role">IUBAT</div>
            </td>
            <td class="spacer">&nbsp;</td>
        </tr>
    </table>

    <div class="qr">
        <img src="{{ $qrDataUri }}" alt="Verification QR" />
        <div class="qr-caption">Scan to verify</div>
    </div>
</body>
</html>
