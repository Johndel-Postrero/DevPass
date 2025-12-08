<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne; // Added for activeQrCode

// You need to import the Admin model to define the relationship
use App\Models\Admin; 
use App\Models\Student; // Added Student import for clarity

class Device extends Model
{
    use HasFactory;

    protected $table = 'devices';
    protected $primaryKey = 'laptop_id'; // Matches your migration primary key

    protected $fillable = [
        'student_id',
        'model',
        'serial_number',
        'brand',
        'registration_date',
        'registration_status',
        'approved_by',   // <-- UNCOMMENTED: Needed for approval
        'approved_at',   // <-- UNCOMMENTED: Needed for approval
    ];

    protected $casts = [
        'registration_date' => 'datetime',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // --- RELATIONSHIPS ---

    /**
     * Get the student that owns the device.
     */
    public function student(): BelongsTo
    {
        // NOTE: If Student model doesn't use 'id' as primary key, change the third argument.
        return $this->belongsTo(Student::class, 'student_id', 'id');
    }

    /**
     * Get the admin who approved the device registration.
     */
    public function admin(): BelongsTo
    {
        // THIS WAS MISSING AND CAUSED THE ERROR (based on the controller expecting 'admin')
        // We use 'admin' as the method name to satisfy the controller's Device::with('admin') call.
        return $this->belongsTo(Admin::class, 'approved_by', 'admin_id');
    }

    /**
     * Get the QR codes for the device.
     */
    public function qrCodes(): HasMany
    {
        return $this->hasMany(QRCode::class, 'laptop_id', 'laptop_id');
    }

    // ... Scopes and status methods remain the same ...

    // --- APPROVAL METHODS (Uncommented and made consistent with the controller) ---
    
    /**
     * Approve the device registration.
     */
    public function approve($adminId)
    {
        $this->update([
            'registration_status' => 'active', // Controller sets status to 'active' on approval
            'approved_by' => $adminId,
            'approved_at' => now(),
        ]);
    }

    /**
     * Reject the laptop registration.
     */
    public function reject($adminId)
    {
        $this->update([
            'registration_status' => 'rejected',
            'approved_by' => $adminId,
            'approved_at' => now(),
        ]);
    }
}