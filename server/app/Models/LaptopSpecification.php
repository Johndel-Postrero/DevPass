<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaptopSpecification extends Model
{
    use HasFactory;

    protected $table = 'laptop_specifications';
    protected $primaryKey = 'spec_id';

    protected $fillable = [
        'spec_id',
        'model',
        'processor',
        'motherboard',
        'memory',
        'harddrive',
        'monitor',
        'casing',
        'cd_dvd_rom',
        'operating_system',
    ];

    /**
     * Relationship: A specification can be referenced by multiple devices with the same model
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'model', 'model');
    }
}

