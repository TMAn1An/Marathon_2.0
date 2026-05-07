<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'primary_color',
        'signature_1_path',
        'signature_1_name',
        'signature_1_designation',
        'signature_2_path',
        'signature_2_name',
        'signature_2_designation',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
