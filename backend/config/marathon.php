<?php

return [

    /*
    |--------------------------------------------------------------------------
    | IUBAT SCSE MINI Marathon — platform configuration
    |--------------------------------------------------------------------------
    |
    | Multi-event values live on the `events` table; the values below are the
    | defaults applied to seeded events plus platform-level metadata used by
    | mailers, BIB generation, and verification URLs.
    |
    */

    'platform' => [
        'name' => env('MARATHON_PLATFORM_NAME', 'IUBAT SCSE MINI Marathon'),
        'organizer' => env('MARATHON_ORGANIZER', 'IUBAT School of Computer Science & Engineering'),
        'support_email' => env('MARATHON_SUPPORT_EMAIL', 'marathon@iubat.edu'),
        'frontend_url' => env('MARATHON_FRONTEND_URL', 'http://localhost:5173'),
    ],

    'event_defaults' => [
        'total_slots' => (int) env('MARATHON_TOTAL_SLOTS', 400),
        'guest_slot_limit' => (int) env('MARATHON_GUEST_SLOT_LIMIT', 30),
        'hold_minutes' => (int) env('MARATHON_HOLD_MINUTES', 10),
        'student_fee_bdt' => (int) env('MARATHON_FEE_STUDENT', 500),
        'faculty_fee_bdt' => (int) env('MARATHON_FEE_FACULTY', 800),
    ],

    'registration' => [
        // Global lock — registration form stays hidden until this date even if
        // an event has registration_start_date unset. Admin can override per
        // event by setting status = live.
        'global_unlock_at' => env('MARATHON_REGISTRATION_UNLOCK_AT', '2026-05-20 00:00:00'),
        'timezone' => env('MARATHON_TIMEZONE', 'Asia/Dhaka'),
    ],

    'bib' => [
        'prefix' => env('MARATHON_BIB_PREFIX', 'MIN'),
        'separator' => env('MARATHON_BIB_SEPARATOR', '_'),
        'pad_length' => (int) env('MARATHON_BIB_PAD_LENGTH', 4),
    ],

    'verification' => [
        'url_template' => env(
            'MARATHON_VERIFY_URL',
            'http://localhost:5173/verify/{uuid}'
        ),
    ],
];
