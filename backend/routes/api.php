<?php

use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CertificateTemplateController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\Admin\GuestParticipantController;
use App\Http\Controllers\Api\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Api\Admin\ParticipantController as AdminParticipantController;
use App\Http\Controllers\Api\Admin\PostController as AdminPostController;
use App\Http\Controllers\Api\Admin\ResultController;
use App\Http\Controllers\Api\Admin\SponsorController as AdminSponsorController;
use App\Http\Controllers\Api\Admin\VolunteerController as AdminVolunteerController;
use App\Http\Controllers\Api\Public\CertificateController as PublicCertificateController;
use App\Http\Controllers\Api\Public\EventInfoController as PublicEventInfoController;
use App\Http\Controllers\Api\Public\GalleryController as PublicGalleryController;
use App\Http\Controllers\Api\Public\PaymentController as PublicPaymentController;
use App\Http\Controllers\Api\Public\PostController as PublicPostController;
use App\Http\Controllers\Api\Public\RegistrationController as PublicRegistrationController;
use App\Http\Controllers\Api\Public\SlotController as PublicSlotController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public endpoints
|--------------------------------------------------------------------------
*/
Route::prefix('events')->group(function () {
    Route::get('/', [PublicEventInfoController::class, 'index']);
    Route::get('/{event:slug}', [PublicEventInfoController::class, 'show']);
    Route::get('/{event:slug}/registration-status', [PublicEventInfoController::class, 'registrationStatus']);
    Route::get('/{event:slug}/slots', [PublicSlotController::class, 'show']);

    Route::middleware('throttle:30,1')->group(function () {
        Route::post('/{event:slug}/registration', [PublicRegistrationController::class, 'store']);
        Route::post('/{event:slug}/payments/initiate', [PublicPaymentController::class, 'initiate']);
    });
});

Route::middleware('throttle:30,1')->group(function () {
    Route::post('/payments/confirm', [PublicPaymentController::class, 'confirm']);
});

Route::get('/payments/{transaction}', [PublicPaymentController::class, 'show']);

Route::get('/event-info', [PublicEventInfoController::class, 'platform']);
Route::get('/event-info/sponsors', [PublicEventInfoController::class, 'sponsors']);
Route::get('/event-info/volunteers', [PublicEventInfoController::class, 'volunteers']);

Route::prefix('posts')->group(function () {
    Route::get('/', [PublicPostController::class, 'index']);
    Route::get('/{post:slug}', [PublicPostController::class, 'show']);
});

Route::prefix('gallery')->group(function () {
    Route::get('/', [PublicGalleryController::class, 'index']);
});

Route::prefix('certificates')->group(function () {
    Route::get('/lookup', [PublicCertificateController::class, 'lookup']);
    Route::get('/{uuid}/verify', [PublicCertificateController::class, 'verify']);
    Route::get('/{uuid}/download', [PublicCertificateController::class, 'download']);
});

/*
|--------------------------------------------------------------------------
| Admin endpoints
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware(['auth:admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::get('/dashboard', [AdminDashboardController::class, 'stats']);

        Route::apiResource('events', AdminEventController::class);
        Route::post('/events/{event}/status', [AdminEventController::class, 'setStatus']);
        Route::post('/events/{event}/disable-override', [AdminEventController::class, 'disableOverride']);

        Route::get('/events/{event}/participants', [AdminParticipantController::class, 'index']);
        Route::get('/events/{event}/participants/export', [AdminParticipantController::class, 'export']);
        Route::post('/events/{event}/guest-participants', [GuestParticipantController::class, 'store']);

        Route::get('/participants/{participant}', [AdminParticipantController::class, 'show']);
        Route::patch('/participants/{participant}', [AdminParticipantController::class, 'update']);
        Route::post('/participants/{participant}/verify-payment', [AdminParticipantController::class, 'verifyPayment']);
        Route::put('/participants/{participant}/results', [ResultController::class, 'update']);

        Route::apiResource('posts', AdminPostController::class);
        Route::post('/posts/{post}/publish', [AdminPostController::class, 'publish']);
        Route::post('/posts/{post}/unpublish', [AdminPostController::class, 'unpublish']);

        Route::get('/events/{event}/certificate-template', [CertificateTemplateController::class, 'show']);
        Route::put('/events/{event}/certificate-template', [CertificateTemplateController::class, 'update']);
        Route::post('/events/{event}/certificate-template/duplicate-from/{source}',
            [CertificateTemplateController::class, 'duplicate']);

        Route::apiResource('gallery', AdminGalleryController::class)->only(['index', 'store', 'destroy']);

        Route::post('/notifications/bulk', [AdminNotificationController::class, 'bulk']);

        Route::apiResource('sponsors', AdminSponsorController::class);
        Route::apiResource('volunteers', AdminVolunteerController::class);

        // Super-admin only
        Route::middleware('super_admin')->group(function () {
            Route::apiResource('admins', AdminUserController::class);
        });
    });
});
