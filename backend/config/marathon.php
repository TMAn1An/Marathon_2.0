<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Marathon event configuration
    |--------------------------------------------------------------------------
    |
    | These values control the runtime behaviour of the Marathon
    | Management System: total available slots, registration fees, slot
    | reservation TTL, BIB number prefix, and event metadata used in
    | certificates and emails.
    |
    */

    'event' => [
        'name' => env('MARATHON_EVENT_NAME', 'Community 10K Marathon'),
        'tagline' => env('MARATHON_EVENT_TAGLINE', 'A community run for everyone: first-timers, club runners and families.'),
        'date' => env('MARATHON_EVENT_DATE', '2026-12-12'),
        'venue' => env('MARATHON_EVENT_VENUE', 'City Central Park'),
        'organizer' => env('MARATHON_EVENT_ORGANIZER', 'Marathon Organizing Committee'),
        // ISO 4217 code used when showing fees.
        'currency' => env('MARATHON_CURRENCY', 'BDT'),
        'distance_km' => (int) env('MARATHON_DISTANCE_KM', 10),
        // OpenStreetMap / Google Maps *embed* URL for the route page. Leave empty to hide the map.
        'map_embed_url' => env('MARATHON_MAP_EMBED_URL'),
        'result_url' => env('MARATHON_RESULT_URL'),
        'support_email' => env('MARATHON_SUPPORT_EMAIL', 'hello@example.com'),
    ],

    'slots' => [
        'total' => (int) env('MARATHON_TOTAL_SLOTS', 400),
        // Slot reservation TTL in minutes (10 minutes per spec).
        'hold_minutes' => (int) env('MARATHON_HOLD_MINUTES', 10),
    ],

    /*
    | Registration categories. The array key is stored on each participant;
    | label and fee are what runners see. Add, remove or rename entries to
    | suit your event (e.g. "open", "student", "veteran").
    */
    'categories' => [
        'open' => [
            'label' => env('MARATHON_CATEGORY_OPEN_LABEL', 'Open'),
            'fee' => (int) env('MARATHON_FEE_OPEN', 800),
        ],
        'student' => [
            'label' => env('MARATHON_CATEGORY_STUDENT_LABEL', 'Student'),
            'fee' => (int) env('MARATHON_FEE_STUDENT', 500),
        ],
    ],

    'bib' => [
        'prefix' => env('MARATHON_BIB_PREFIX', 'RUN'),
        // Total length of the numeric component, zero-padded.
        'pad_length' => (int) env('MARATHON_BIB_PAD_LENGTH', 4),
    ],

    'payments' => [
        // "manual"    : the runner pays the merchant number by bKash/Nagad and
        //               submits the TrxID; an admin verifies it. Safe for production.
        // "simulated" : demo checkout where the browser confirms its own payment.
        //               Anyone can mark themselves paid, so it is refused when
        //               APP_ENV=production.
        'mode' => env('MARATHON_PAYMENT_MODE', 'manual'),
        'merchant' => [
            'bkash' => env('MARATHON_BKASH_NUMBER', ''),
            'nagad' => env('MARATHON_NAGAD_NUMBER', ''),
        ],
        // How long a slot stays reserved once a TrxID is submitted and is
        // waiting for an admin to verify it.
        'verification_hold_hours' => (int) env('MARATHON_VERIFICATION_HOLD_HOURS', 48),
    ],

    'certificates' => [
        // When true, only runners with a recorded finish time can download one.
        'require_finish' => (bool) env('MARATHON_CERT_REQUIRE_FINISH', true),
    ],

    'verification' => [
        // Public-facing certificate verification URL template. {uuid} is replaced.
        'url_template' => env(
            'MARATHON_VERIFY_URL',
            'http://localhost:5173/verify/{uuid}'
        ),
    ],
];
