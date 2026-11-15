<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InitiatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'participant_token' => ['required', 'string', 'exists:participants,public_token'],
            'gateway' => ['required', Rule::in(['bkash', 'nagad'])],
        ];
    }
}
