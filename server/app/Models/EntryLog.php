<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntryLog extends Model
{
    use HasFactory;

    protected $table = 'entry_log';
    protected $primaryKey = 'log_id';

    protected $fillable = [
        'qr_id',
        'qr_code_hash',
        'gate_id',
        'security_guard_id',
        'scan_timestamp',
        'status',
    ];

    protected $casts = [
        'scan_timestamp' => 'datetime',
    ];

    public function qrCode(): BelongsTo
    {
        return $this->belongsTo(QRCode::class, 'qr_code_hash', 'qr_code_hash');
    }

    public function gate(): BelongsTo
    {
        return $this->belongsTo(Gate::class, 'gate_id', 'gate_id');
    }

    public function securityGuard(): BelongsTo
    {
        return $this->belongsTo(SecurityGuard::class, 'security_guard_id', 'guard_id');
    }
}
