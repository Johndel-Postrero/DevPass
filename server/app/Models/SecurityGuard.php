<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class SecurityGuard extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'security_guards';
    protected $primaryKey = 'guard_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'guard_id',
        'name',
        'email',
        'phone',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    // Automatically hash password when setting it
    public function setPasswordAttribute($value)
    {
        // Only hash if it's not already hashed (to prevent double hashing)
        if (!empty($value)) {
            // Check if value is already a bcrypt hash (starts with $2y$)
            if (strlen($value) === 60 && strpos($value, '$2y$') === 0) {
                // Already hashed, use as is
                $this->attributes['password'] = $value;
            } else {
                // Not hashed, hash it
                $this->attributes['password'] = Hash::make($value);
            }
        }
    }

    public function entryLogs(): HasMany
    {
        return $this->hasMany(EntryLog::class, 'security_guard_id', 'guard_id');
    }
}
