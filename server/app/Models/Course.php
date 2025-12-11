<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Course extends Model
{
    use HasFactory;

    // Table name (non-plural)
    protected $table = 'course';

    // Primary key (integer per database diagram)
    protected $primaryKey = 'course_id';

    // Primary key is auto-incrementing (integer)
    public $incrementing = true;

    // Key type
    protected $keyType = 'int';

    // Mass assignable fields
    protected $fillable = [
        'course_id',
        'course_name',
        'course_code',
        'description',
    ];

    /**
     * Relationship: A course has many students
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'course_id', 'course_id');
    }
}
