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

    // Primary key
    protected $primaryKey = 'course_id';

    // Primary key is not auto-incrementing (string type)
    public $incrementing = false;

    // Key type
    protected $keyType = 'string';

    // Mass assignable fields
    protected $fillable = [
        'course_id',
        'course_name',
        'course_code',
        'description',
        'department_id',
    ];

    /**
     * Relationship: A course belongs to a department
     */
    // public function department()
    // {
    //     return $this->belongsTo(Department::class, 'department_id', 'department_id');
    // }
}
