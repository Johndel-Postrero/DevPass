<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Needed for device()
use Illuminate\Database\Eloquent\Relations\HasMany;   // Needed for entryLogs()

class QRCode extends Model
{
    use HasFactory;

    protected $table = 'qr_codes';
    protected $primaryKey = 'qr_id';

    protected $fillable = [
        // Retaining 'laptop_id' as the correct foreign key, 
        // and removing the confusing 'device_id'.
        'laptop_id',
        'qr_code_hash',
        'generated_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // --- RELATIONSHIPS ---

    /**
     * Get the Device that owns the QR Code.
     * This links the QR code back to the Devices table using the foreign key 'laptop_id'.
     */
    public function device(): BelongsTo
    {
        // FOREIGN KEY: 'laptop_id' (on qr_codes table)
        // OWNER KEY: 'laptop_id' (on devices table)
        return $this->belongsTo(Device::class, 'laptop_id', 'laptop_id');
    }

    /**
     * Get the entry logs associated with the QR Code.
     * This uses the non-standard key 'qr_code_hash' for the relationship.
     */
    public function entryLogs(): HasMany
    {
        // FOREIGN KEY: 'qr_code_hash' (on entry_log table)
        // LOCAL KEY: 'qr_code_hash' (on qr_codes table)
        return $this->hasMany(EntryLog::class, 'qr_code_hash', 'qr_code_hash');
    }
}