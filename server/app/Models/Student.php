<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'students';
    
    // Specify the custom primary key (since it's not the default 'id')
    protected $primaryKey = 'id';
    
    // Indicate the primary key is a string
    protected $keyType = 'string';
    
    // Set incrementing to false because strings are not auto-incrementing
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'email',
        'phone',
        'department_id',
        'course_id',
        'year_of_study',
        'password', // Add password field
    ];

    protected $hidden = [
        'password',
        'remember_token',
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

    // public function department()
    // {
    //     return $this->belongsTo(Department::class, 'department_id');
    // }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}