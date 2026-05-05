<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Marathon event configuration
    |--------------------------------------------------------------------------
    |
    | These values control the runtime behaviour of the IUBAT CSE 10K Marathon
    | Management System: total available slots, registration fees, slot
    | reservation TTL, BIB number prefix, and event metadata used in
    | certificates and emails.
    |
    */

    'event' => [
        'name' => env('MARATHON_EVENT_NAME', 'IUBAT CSE 10K Marathon'),
        'date' => env('MARATHON_EVENT_DATE', '2026-12-12'),
        'venue' => env('MARATHON_EVENT_VENUE', 'IUBAT Main Campus, Uttara, Dhaka'),
        'organizer' => env('MARATHON_EVENT_ORGANIZER', 'IUBAT CSE Department'),
        'result_url' => env('MARATHON_RESULT_URL', 'https://example.com/marathon-results'),
        'support_email' => env('MARATHON_SUPPORT_EMAIL', 'marathon@iubat.edu'),
    ],

    'slots' => [
        'total' => (int) env('MARATHON_TOTAL_SLOTS', 400),
        // Slot reservation TTL in minutes (10 minutes per spec).
        'hold_minutes' => (int) env('MARATHON_HOLD_MINUTES', 10),
    ],

    'fees' => [
        'student' => (int) env('MARATHON_FEE_STUDENT', 500),
        'faculty' => (int) env('MARATHON_FEE_FACULTY', 1000),
    ],

    'bib' => [
        'prefix' => env('MARATHON_BIB_PREFIX', 'IUB'),
        // Total length of the numeric component, zero-padded.
        'pad_length' => (int) env('MARATHON_BIB_PAD_LENGTH', 4),
    ],

    'verification' => [
        // Public-facing certificate verification URL template. {uuid} is replaced.
        'url_template' => env(
            'MARATHON_VERIFY_URL',
            'http://localhost:5173/verify/{uuid}'
        ),
    ],
];
