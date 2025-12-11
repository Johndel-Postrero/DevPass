<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gate extends Model
{
    use HasFactory;

    protected $table = 'gates';
    protected $primaryKey = 'gate_id';

    protected $fillable = [
        'gate_name',
        'location',
        'is_active', // Per database diagram
    ];

    public function entryLogs(): HasMany
    {
        return $this->hasMany(EntryLog::class, 'gate_id', 'gate_id');
    }
}
