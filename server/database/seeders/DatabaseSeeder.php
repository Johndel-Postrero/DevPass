<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin Account
        Student::firstOrCreate(
            ['id' => '22222222'],
            [
                'name' => 'Admin User',
                'email' => 'admin@devpass.com',
                'password' => 'admin123', // Will be auto-hashed by Student model
                'course_id' => '1',
                // 'department' => 'Administration',
                'phone' => '1234567890',
            ]
        );

        // Create Security Personnel Account
        Student::firstOrCreate(
            ['id' => '33333333'],
            [
                'name' => 'Security Personnel',
                'email' => 'security@devpass.com',
                'password' => 'security123', // Will be auto-hashed by Student model
                'course_id' => '2',
                // 'department' => 'Security',
                'phone' => '0987654321',
            ]
        );

        echo "✅ Admin account created:\n";
        echo "   ID: 2222222\n";
        echo "   Email: admin@devpass.com\n";
        echo "   Password: admin123\n\n";
        
        echo "✅ Security account created:\n";
        echo "   ID: 33333333\n";
        echo "   Email: security@devpass.com\n";
        echo "   Password: security123\n";
    }
}
