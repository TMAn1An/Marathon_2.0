<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\Participant;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailable;

class NotificationService
{
    /**
     * Sends a registration confirmation email and logs a mock SMS.
     * Failures are logged but never throw — registration must not fail
     * because the mail server is down.
     */
    public function sendRegistrationConfirmation(Participant $participant): void
    {
        $event = config('marathon.event.name');
        $subject = "{$event} – Registration Confirmed";
        $body = $this->buildRegistrationBody($participant);

        $this->logAndSendEmail($participant, 'registration', $subject, $body);
        $this->logMockSms(
            $participant,
            'registration',
            $participant->phone,
            "Hi {$participant->full_name}, your {$event} registration is confirmed. BIB: {$participant->bib_number}."
        );
    }

    /**
     * Sends a bulk notification to a collection of participants.
     * Returns the number of recipients dispatched.
     */
    public function sendBulk(iterable $participants, string $subject, string $body, string $channel = 'email'): int
    {
        $count = 0;
        foreach ($participants as $participant) {
            if ($channel === NotificationLog::CHANNEL_SMS) {
                $this->logMockSms($participant, 'bulk', $participant->phone, $body);
            } else {
                $this->logAndSendEmail($participant, 'bulk', $subject, $body);
            }
            $count++;
        }

        return $count;
    }

    protected function logAndSendEmail(Participant $participant, string $type, string $subject, string $body): void
    {
        $log = NotificationLog::create([
            'participant_id' => $participant->id,
            'channel' => NotificationLog::CHANNEL_EMAIL,
            'type' => $type,
            'recipient' => $participant->email,
            'subject' => $subject,
            'body' => $body,
            'status' => NotificationLog::STATUS_QUEUED,
        ]);

        try {
            Mail::raw($body, function ($message) use ($participant, $subject) {
                $message->to($participant->email, $participant->full_name)
                    ->subject($subject);
            });
            $log->update([
                'status' => NotificationLog::STATUS_SENT,
                'sent_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Marathon email notification failed', [
                'participant_id' => $participant->id,
                'error' => $e->getMessage(),
            ]);
            $log->update([
                'status' => NotificationLog::STATUS_FAILED,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function logMockSms(Participant $participant, string $type, string $recipient, string $body): void
    {
        // Mock SMS gateway – just store the payload and mark as sent.
        Log::info('Marathon mock SMS', [
            'to' => $recipient,
            'body' => $body,
        ]);

        NotificationLog::create([
            'participant_id' => $participant->id,
            'channel' => NotificationLog::CHANNEL_SMS,
            'type' => $type,
            'recipient' => $recipient,
            'subject' => null,
            'body' => $body,
            'status' => NotificationLog::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    protected function buildRegistrationBody(Participant $participant): string
    {
        $event = config('marathon.event.name');
        $date = config('marathon.event.date');
        $venue = config('marathon.event.venue');
        $support = config('marathon.event.support_email');

        return "Hello {$participant->full_name},\n\n"
            . "Thank you for registering for the {$event}!\n\n"
            . "Your registration is confirmed.\n"
            . "BIB Number: {$participant->bib_number}\n"
            . "Category: " . ucfirst($participant->category) . "\n"
            . "T-shirt size: {$participant->tshirt_size}\n\n"
            . "Event Date: {$date}\n"
            . "Venue: {$venue}\n\n"
            . "Please arrive 30 minutes early for BIB collection.\n"
            . "For queries, contact {$support}.\n\n"
            . "See you at the starting line!";
    }
}
