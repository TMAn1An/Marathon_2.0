<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Participant extends Model
{
    use HasFactory;

    public const STATUS_RESERVED = 'reserved';

    public const STATUS_PENDING_PAYMENT = 'pending_payment';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'public_token',
        'finish_time_seconds',
        'bib_number',
        'full_name',
        'id_number',
        'category',
        'phone',
        'email',
        'emergency_contact',
        'tshirt_size',
        'status',
        'slot_reserved_until',
        'confirmed_at',
        'meta',
    ];

    protected $casts = [
        'slot_reserved_until' => 'datetime',
        'confirmed_at' => 'datetime',
        'meta' => 'array',
        'finish_time_seconds' => 'integer',
    ];

    protected $appends = ['finish_time'];

    protected static function booted(): void
    {
        static::creating(function (Participant $participant) {
            $participant->public_token ??= strtolower((string) Str::ulid());
        });
    }

    /** @return list<string> The category ids allowed by config. */
    public static function categoryIds(): array
    {
        return array_keys(config('marathon.categories', []));
    }

    /** Race time formatted as H:MM:SS, or null when no result is recorded. */
    public function getFinishTimeAttribute(): ?string
    {
        $s = $this->finish_time_seconds;

        return $s === null ? null : sprintf('%d:%02d:%02d', intdiv($s, 3600), intdiv($s % 3600, 60), $s % 60);
    }

    /** Parses "H:MM:SS" / "MM:SS" into seconds. Returns null if invalid. */
    public static function parseFinishTime(?string $value): ?int
    {
        if ($value === null || ! preg_match('/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/', trim($value), $m)) {
            return null;
        }
        [$h, $min, $sec] = [(int) $m[1], (int) $m[2], (int) $m[3]];

        return $min > 59 || $sec > 59 ? null : $h * 3600 + $min * 60 + $sec;
    }

    /**
     * The only participant fields ever exposed through public endpoints:
     * no email, phone or emergency contact.
     */
    public function publicSummary(): array
    {
        return [
            'token' => $this->public_token,
            'full_name' => $this->full_name,
            'category' => $this->category,
            'id_number' => $this->id_number,
            'category_label' => config("marathon.categories.{$this->category}.label", ucfirst((string) $this->category)),
            'status' => $this->status,
            'bib_number' => $this->bib_number,
        ];
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

    public function reservationActive(): bool
    {
        return in_array($this->status, [self::STATUS_RESERVED, self::STATUS_PENDING_PAYMENT], true)
            && $this->slot_reserved_until
            && $this->slot_reserved_until->isFuture();
    }
}
