<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'string', 'min:3', 'max:150'],
            'university_id' => ['sometimes', 'nullable', 'string', 'max:50'],
            'category' => ['sometimes', Rule::in(['student', 'faculty', 'guest'])],
            'gender' => ['sometimes', 'nullable', Rule::in(['male', 'female'])],
            'department' => ['sometimes', 'nullable', 'string', 'max:120'],
            'phone' => ['sometimes', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
            'email' => ['sometimes', 'email:rfc', 'max:191'],
            'emergency_contact' => ['sometimes', 'nullable', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
            'tshirt_size' => ['sometimes', Rule::in(['XS', 'S', 'M', 'L', 'XL', 'XXL'])],
            'status' => ['sometimes', Rule::in(['reserved', 'pending_payment', 'confirmed', 'cancelled'])],
        ];
    }
}
