<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    use HasFactory;

    public const STATUS_UPCOMING = 'upcoming';
    public const STATUS_LIVE = 'live';
    public const STATUS_PAST = 'past';

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'description',
        'location',
        'hero_image_path',
        'event_start_date',
        'registration_start_date',
        'total_slots',
        'guest_slot_limit',
        'hold_minutes',
        'student_fee_bdt',
        'faculty_fee_bdt',
        'status',
        'manual_override',
        'is_visible',
    ];

    protected $casts = [
        'event_start_date' => 'datetime',
        'registration_start_date' => 'datetime',
        'manual_override' => 'boolean',
        'is_visible' => 'boolean',
        'total_slots' => 'integer',
        'guest_slot_limit' => 'integer',
        'hold_minutes' => 'integer',
        'student_fee_bdt' => 'integer',
        'faculty_fee_bdt' => 'integer',
    ];

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function certificateTemplate(): HasOne
    {
        return $this->hasOne(CertificateTemplate::class);
    }

    public function galleryImages(): HasMany
    {
        return $this->hasMany(GalleryImage::class);
    }

    public function isLive(): bool
    {
        return $this->status === self::STATUS_LIVE;
    }

    public function isPast(): bool
    {
        return $this->status === self::STATUS_PAST;
    }

    public function isUpcoming(): bool
    {
        return $this->status === self::STATUS_UPCOMING;
    }

    public function registrationOpensAt(): Carbon
    {
        return $this->registration_start_date ?? $this->event_start_date;
    }

    public function registrationOpen(): bool
    {
        if ($this->isPast()) {
            return false;
        }

        if ($this->isLive()) {
            return true;
        }

        return now()->greaterThanOrEqualTo($this->registrationOpensAt());
    }

    public function publicSlotStart(): int
    {
        return $this->guest_slot_limit + 1;
    }
}
