<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne; // Added for activeQrCode

// You need to import the Admin model to define the relationship
use App\Models\Admin; 
use App\Models\Student; // Added Student import for clarity
use App\Models\LaptopSpecification; // Added for specifications relationship

class Device extends Model
{
    use HasFactory, SoftDeletes;

    // Note: Table is 'devices' but represents LAPTOP per database diagram
    protected $table = 'devices';
    protected $primaryKey = 'laptop_id'; // Matches database diagram

    protected $fillable = [
        'student_id',
        'model',           // Per database diagram: string
        'serial_number',  // Per database diagram: varchar(100) unique
        'brand',          // Per database diagram: varchar(50) not null
        'registration_date',
        'registration_status',
        'approved_by',    // Per database diagram: FK to ADMIN.admin_id
        'approved_at',
        'original_values', // Added in migration 2025_12_08_174216_add_devices_original_values.php
        'last_action',    // Added in migration 2025_12_08_174216_add_devices_original_values.php
    ];

    protected $casts = [
        'registration_date' => 'datetime',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'original_values' => 'array', // Cast JSON to array
    ];

    // --- RELATIONSHIPS ---

    /**
     * Get the student that owns the laptop.
     */
    public function student(): BelongsTo
    {
        // Foreign key on devices table is 'student_id'
        // Student model uses 'student_id' as primary key per migration
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
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

    /**
     * Get the laptop specifications for this model.
     * Multiple devices can share the same model and reference the same specifications.
     */
    public function specifications(): BelongsTo
    {
        return $this->belongsTo(LaptopSpecification::class, 'model', 'model');
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