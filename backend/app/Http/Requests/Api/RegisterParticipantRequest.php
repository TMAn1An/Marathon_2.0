<?php

namespace App\Http\Requests\Api;

use App\Models\Participant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->input('email'))),
            'phone' => preg_replace('/[\s\-]+/', '', (string) $this->input('phone')),
            'emergency_contact' => preg_replace('/[\s\-]+/', '', (string) $this->input('emergency_contact')),
            'full_name' => trim((string) $this->input('full_name')),
            'id_number' => trim((string) $this->input('id_number')) ?: null,
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'min:3', 'max:150'],
            'id_number' => ['nullable', 'string', 'max:50'],
            'category' => ['required', Rule::in(Participant::categoryIds())],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9]{7,15}$/'],
            'email' => ['required', 'email:rfc', 'max:191'],
            'emergency_contact' => ['required', 'string', 'regex:/^\+?[0-9]{7,15}$/'],
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
