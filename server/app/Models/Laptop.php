<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class Laptop extends Model
// {
//     use HasFactory;

    

//     protected $table = 'laptop';
//     protected $primaryKey = 'laptop_id';

//     protected $fillable = [
//         'student_id',
//         'model',
//         'serial_number',
//         'brand',
//         'registration_date',
//         'registration_status',
//         'approved_by',
//         'approved_at',
//     ];

//     protected $casts = [
//         'registration_date' => 'datetime',
//         'approved_at' => 'datetime',
//         'created_at' => 'datetime',
//         'updated_at' => 'datetime',
//     ];

//     /**
//      * Get the student that owns the laptop.
//      */
//     public function student()
//     {
//         return $this->belongsTo(Student::class, 'student_id', 'id');
//     }

//     /**
//      * Get the admin who approved the laptop registration.
//      */
//     public function approver()
//     {
//         return $this->belongsTo(Admin::class, 'approved_by', 'id');
//     }

//     /**
//      * Get the QR codes for the laptop.
//      */
//     public function qrCodes()
//     {
//         return $this->hasMany(QRCode::class, 'laptop_id', 'laptop_id');
//     }

//     /**
//      * Get the active QR code for the laptop.
//      */
//     public function activeQrCode()
//     {
//         return $this->hasOne(QRCode::class, 'laptop_id', 'laptop_id')
//                     ->where('is_active', true)
//                     ->latest('generated_at');
//     }

//     /**
//      * Scope a query to only include pending laptops.
//      */
//     public function scopePending($query)
//     {
//         return $query->where('registration_status', 'pending');
//     }

//     /**
//      * Scope a query to only include approved laptops.
//      */
//     public function scopeApproved($query)
//     {
//         return $query->where('registration_status', 'approved');
//     }

//     /**
//      * Scope a query to only include rejected laptops.
//      */
//     public function scopeRejected($query)
//     {
//         return $query->where('registration_status', 'rejected');
//     }

//     /**
//      * Check if the laptop is approved.
//      */
//     public function isApproved()
//     {
//         return $this->registration_status === 'approved';
//     }

//     /**
//      * Check if the laptop is pending.
//      */
//     public function isPending()
//     {
//         return $this->registration_status === 'pending';
//     }

//     /**
//      * Check if the laptop is rejected.
//      */
//     public function isRejected()
//     {
//         return $this->registration_status === 'rejected';
//     }

//     /**
//      * Approve the laptop registration.
//      */
//     public function approve($adminId)
//     {
//         $this->update([
//             'registration_status' => 'approved',
//             'approved_by' => $adminId,
//             'approved_at' => now(),
//         ]);
//     }

//     /**
//      * Reject the laptop registration.
//      */
//     public function reject($adminId)
//     {
//         $this->update([
//             'registration_status' => 'rejected',
//             'approved_by' => $adminId,
//             'approved_at' => now(),
//         ]);
//     }
// }