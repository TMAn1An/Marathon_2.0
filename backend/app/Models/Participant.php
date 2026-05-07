<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Participant extends Model
{
    use HasFactory;

    public const STATUS_RESERVED = 'reserved';
    public const STATUS_PENDING_PAYMENT = 'pending_payment';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';

    public const CATEGORY_STUDENT = 'student';
    public const CATEGORY_FACULTY = 'faculty';
    public const CATEGORY_GUEST = 'guest';

    public const PUBLIC_CATEGORIES = [self::CATEGORY_STUDENT, self::CATEGORY_FACULTY];

    protected $fillable = [
        'event_id',
        'bib_number',
        'full_name',
        'university_id',
        'category',
        'gender',
        'department',
        'phone',
        'email',
        'emergency_contact',
        'tshirt_size',
        'status',
        'slot_reserved_until',
        'confirmed_at',
        'chip_time',
        'overall_place',
        'gender_place',
        'meta',
    ];

    protected $casts = [
        'slot_reserved_until' => 'datetime',
        'confirmed_at' => 'datetime',
        'meta' => 'array',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    public function isConfirmed(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function isGuest(): bool
    {
        return $this->category === self::CATEGORY_GUEST;
    }

    public function reservationActive(): bool
    {
        return in_array($this->status, [self::STATUS_RESERVED, self::STATUS_PENDING_PAYMENT], true)
            && $this->slot_reserved_until
            && $this->slot_reserved_until->isFuture();
    }

    public function hasResults(): bool
    {
        return $this->chip_time !== null
            || $this->overall_place !== null
            || $this->gender_place !== null;
    }
}
