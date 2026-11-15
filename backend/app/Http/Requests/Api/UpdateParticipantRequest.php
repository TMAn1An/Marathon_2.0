<?php

namespace App\Http\Requests\Api;

use App\Models\Participant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['phone', 'emergency_contact'] as $field) {
            if ($this->has($field)) {
                $this->merge([$field => preg_replace('/[\s\-]+/', '', (string) $this->input($field))]);
            }
        }
        if ($this->has('email')) {
            $this->merge(['email' => strtolower(trim((string) $this->input('email')))]);
        }
    }

    public function rules(): array
    {
        $id = $this->route('participant')?->id;

        return [
            'full_name' => ['sometimes', 'string', 'min:3', 'max:150'],
            'id_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'category' => ['sometimes', Rule::in(Participant::categoryIds())],
            'phone' => [
                'sometimes',
                'string',
                'regex:/^\+?[0-9]{7,15}$/',
                Rule::unique('participants', 'phone')->ignore($id)
                    ->whereIn('status', ['reserved', 'pending_payment', 'confirmed']),
            ],
            'email' => [
                'sometimes',
                'email:rfc',
                'max:191',
                Rule::unique('participants', 'email')->ignore($id)
                    ->whereIn('status', ['reserved', 'pending_payment', 'confirmed']),
            ],
            'emergency_contact' => ['sometimes', 'string', 'regex:/^\+?[0-9]{7,15}$/'],
            'tshirt_size' => ['sometimes', Rule::in(['XS', 'S', 'M', 'L', 'XL', 'XXL'])],
            'finish_time' => ['sometimes', 'nullable', 'regex:/^(\d{1,2}:)?\d{1,2}:\d{2}$/'],
            'status' => ['sometimes', Rule::in(['reserved', 'pending_payment', 'confirmed', 'cancelled'])],
        ];
    }
}
