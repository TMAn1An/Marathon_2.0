<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SubmitPaymentReferenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_id' => ['required', 'string', 'exists:payments,transaction_id'],
            'participant_token' => ['required', 'string'],
            'reference' => ['required', 'string', 'regex:/^[A-Za-z0-9]{6,32}$/'],
            'payer_phone' => ['nullable', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'reference.regex' => 'Enter the TrxID exactly as shown in your bKash/Nagad receipt (letters and digits only).',
        ];
    }
}
