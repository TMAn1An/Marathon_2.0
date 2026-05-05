<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'min:3', 'max:150'],
            'university_id' => ['required', 'string', 'max:50'],
            'category' => ['required', Rule::in(['student', 'faculty'])],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
            'email' => ['required', 'email:rfc', 'max:191'],
            'emergency_contact' => ['required', 'string', 'regex:/^\+?[0-9 \-]{7,20}$/'],
            'tshirt_size' => ['required', Rule::in(['XS', 'S', 'M', 'L', 'XL', 'XXL'])],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'The phone number format is invalid.',
            'emergency_contact.regex' => 'The emergency contact format is invalid.',
        ];
    }
}
