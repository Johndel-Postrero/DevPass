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
    
    // Primary key is 'student_id' per migration (2025_11_11_110907_create_students_table.php)
    // The migration shows: $table->string('student_id', 20)->primary();
    protected $primaryKey = 'student_id';
    
    // Indicate the primary key is a string (varchar(20))
    protected $keyType = 'string';
    
    // Set incrementing to false because strings are not auto-incrementing
    public $incrementing = false;

    protected $fillable = [
        'id',           // For existing databases with 'id' column
        'student_id',   // For new databases with 'student_id' column
        'name',
        'email',
        'phone',
        'course_id',
        'year_of_study',
        'password',
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

    /**
     * Relationship: Student enrolled in a Course
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    /**
     * Get all laptops/devices for this student
     */
    public function devices()
    {
        // Check which primary key column exists in students table
        $hasStudentId = \Illuminate\Support\Facades\Schema::hasColumn('students', 'student_id');
        $localKey = $hasStudentId ? 'student_id' : 'id';
        
        // Foreign key on devices table is 'student_id', local key depends on database structure
        return $this->hasMany(Device::class, 'student_id', $localKey);
    }

    /**
     * Accessor for backward compatibility - allows accessing 'id' or 'student_id'
     */
    public function getIdAttribute()
    {
        // Return whichever column exists
        return $this->attributes['student_id'] ?? $this->attributes['id'] ?? null;
    }
    
    /**
     * Accessor for student_id - returns id if student_id doesn't exist
     */
    public function getStudentIdAttribute()
    {
        return $this->attributes['student_id'] ?? $this->attributes['id'] ?? null;
    }

    /**
     * Mutator for backward compatibility - sets both 'id' and 'student_id' if possible
     */
    public function setIdAttribute($value)
    {
        // Set both columns if they exist, prioritizing the actual primary key
        if (\Illuminate\Support\Facades\Schema::hasColumn($this->table, 'student_id')) {
            $this->attributes['student_id'] = $value;
        } else {
            $this->attributes['id'] = $value;
        }
    }
    
    /**
     * Mutator for student_id - also sets id for backward compatibility
     */
    public function setStudentIdAttribute($value)
    {
        if (\Illuminate\Support\Facades\Schema::hasColumn($this->table, 'student_id')) {
            $this->attributes['student_id'] = $value;
        } else {
            $this->attributes['id'] = $value;
        }
    }
}