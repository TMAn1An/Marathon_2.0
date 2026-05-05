<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'certificate_uuid',
        'file_path',
        'generated_at',
        'download_count',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'download_count' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Certificate $cert) {
            if (! $cert->certificate_uuid) {
                $cert->certificate_uuid = (string) Str::uuid();
            }
        });
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }
}
