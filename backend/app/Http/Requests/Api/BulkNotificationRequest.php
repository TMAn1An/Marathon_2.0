<?php

namespace App\Http\Requests\Api;

use App\Models\Participant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['required_if:channel,email', 'nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:5', 'max:2000'],
            'channel' => ['required', Rule::in(['email', 'sms'])],
            'category' => ['nullable', Rule::in(Participant::categoryIds())],
            'status' => ['nullable', Rule::in(['reserved', 'pending_payment', 'confirmed', 'cancelled'])],
        ];
    }
}
