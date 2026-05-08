<?php

namespace App\Http\Requests\Api;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $eventId = $this->route('event')?->id;

        return [
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['nullable', 'string', 'max:200', Rule::unique('events', 'slug')->ignore($eventId)],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:180'],
            'event_start_date' => ['required', 'date'],
            'registration_start_date' => ['nullable', 'date'],
            'total_slots' => ['required', 'integer', 'min:1'],
            'guest_slot_limit' => ['required', 'integer', 'min:0'],
            'hold_minutes' => ['required', 'integer', 'min:1', 'max:120'],
            'student_fee_bdt' => ['required', 'integer', 'min:0'],
            'faculty_fee_bdt' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in([Event::STATUS_UPCOMING, Event::STATUS_LIVE, Event::STATUS_PAST])],
            'manual_override' => ['nullable', 'boolean'],
            'is_visible' => ['nullable', 'boolean'],
            'hero_image' => ['nullable', 'image', 'max:8192'],
        ];
    }
}
