<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'admins';
    protected $primaryKey = 'admin_id';

    protected $fillable = [
        'username',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    // Automatically hash password when setting it
    public function setPasswordAttribute($value)
    {
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

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'approved_by', 'admin_id');
    }
}
