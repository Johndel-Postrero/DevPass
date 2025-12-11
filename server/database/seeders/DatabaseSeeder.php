<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\SecurityGuard;
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
        // Create Admin Account in admins table
        Admin::firstOrCreate(
            ['email' => 'admin@devpass.com'],
            [
                'username' => 'admin',
                'email' => 'admin@devpass.com',
                'password' => 'admin123', // Will be auto-hashed by Admin model
            ]
        );

        // Create Security Personnel Account in security_guards table
        SecurityGuard::firstOrCreate(
            ['guard_id' => '33333333'],
            [
                'guard_id' => '33333333',
                'name' => 'Security Personnel',
                'email' => 'security@devpass.com',
                'password' => 'security123', // Will be auto-hashed by SecurityGuard model
                'phone' => '0987654321',
            ]
        );

        // Note: Test student account creation removed to avoid database schema conflicts
        // The Student model expects 'student_id' but database may still have 'id'
        // Students can be created through registration or manually after schema is updated

        echo "✅ Admin account created in admins table:\n";
        echo "   Username: admin\n";
        echo "   Email: admin@devpass.com\n";
        echo "   Password: admin123\n";
        echo "   Login with: username 'admin' or email 'admin@devpass.com'\n\n";
        
        echo "✅ Security account created in security_guards table:\n";
        echo "   Guard ID: 33333333\n";
        echo "   Email: security@devpass.com\n";
        echo "   Password: security123\n";
        echo "   Login with: Guard ID '33333333'\n";
    }
}
