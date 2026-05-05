<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Api\Admin\ParticipantController as AdminParticipantController;
use App\Http\Controllers\Api\Admin\SponsorController as AdminSponsorController;
use App\Http\Controllers\Api\Admin\VolunteerController as AdminVolunteerController;
use App\Http\Controllers\Api\Public\CertificateController as PublicCertificateController;
use App\Http\Controllers\Api\Public\EventInfoController as PublicEventInfoController;
use App\Http\Controllers\Api\Public\PaymentController as PublicPaymentController;
use App\Http\Controllers\Api\Public\RegistrationController as PublicRegistrationController;
use App\Http\Controllers\Api\Public\SlotController as PublicSlotController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public marathon endpoints
|--------------------------------------------------------------------------
*/
Route::prefix('event')->group(function () {
    Route::get('/', [PublicEventInfoController::class, 'show']);
    Route::get('/sponsors', [PublicEventInfoController::class, 'sponsors']);
    Route::get('/volunteers', [PublicEventInfoController::class, 'volunteers']);
});

Route::get('/slots', [PublicSlotController::class, 'show']);

Route::middleware('throttle:30,1')->group(function () {
    Route::post('/registration', [PublicRegistrationController::class, 'store']);
    Route::post('/payments/initiate', [PublicPaymentController::class, 'initiate']);
    Route::post('/payments/confirm', [PublicPaymentController::class, 'confirm']);
});

Route::get('/payments/{transaction}', [PublicPaymentController::class, 'show']);

Route::prefix('certificates')->group(function () {
    Route::get('/lookup', [PublicCertificateController::class, 'lookup']);
    Route::get('/{uuid}/verify', [PublicCertificateController::class, 'verify']);
    Route::get('/{uuid}/download', [PublicCertificateController::class, 'download']);
});

/*
|--------------------------------------------------------------------------
| Admin authentication
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware(['auth:admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::get('/dashboard', [AdminDashboardController::class, 'stats']);

        Route::get('/participants/export', [AdminParticipantController::class, 'export']);
        Route::get('/participants', [AdminParticipantController::class, 'index']);
        Route::get('/participants/{participant}', [AdminParticipantController::class, 'show']);
        Route::patch('/participants/{participant}', [AdminParticipantController::class, 'update']);
        Route::post('/participants/{participant}/verify-payment', [AdminParticipantController::class, 'verifyPayment']);

        Route::post('/notifications/bulk', [AdminNotificationController::class, 'bulk']);

        Route::apiResource('sponsors', AdminSponsorController::class);
        Route::apiResource('volunteers', AdminVolunteerController::class);
    });
});
