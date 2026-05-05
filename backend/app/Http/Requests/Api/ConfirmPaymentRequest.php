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
            'outcome' => ['required', Rule::in(['success', 'failure'])],
            'gateway_reference' => ['nullable', 'string', 'max:191'],
            'payer_phone' => ['nullable', 'string', 'max:32'],
        ];
    }
}
