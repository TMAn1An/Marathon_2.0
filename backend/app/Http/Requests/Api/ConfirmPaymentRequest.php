<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConfirmPaymentRequest extends FormRequest
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
            'outcome' => ['required', Rule::in(['success', 'failure'])],
        ];
    }
}
