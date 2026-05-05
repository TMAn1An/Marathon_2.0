<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('participant')?->id;

        return [
            'full_name' => ['sometimes', 'string', 'min:3', 'max:150'],
            'university_id' => ['sometimes', 'string', 'max:50'],
            'category' => ['sometimes', Rule::in(['student', 'faculty'])],
            'phone' => [
                'sometimes',
                'string',
                'regex:/^\+?[0-9 \-]{7,20}$/',
                Rule::unique('participants', 'phone')->ignore($id),
            ],
            'email' => [
                'sometimes',
                'email:rfc',
                'max:191',
                Rule::unique('participants', 'email')->ignore($id),
            ],
            'emergency_contact' => ['sometimes', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
            'tshirt_size' => ['sometimes', Rule::in(['XS', 'S', 'M', 'L', 'XL', 'XXL'])],
            'status' => ['sometimes', Rule::in(['reserved', 'pending_payment', 'confirmed', 'cancelled'])],
        ];
    }
}
