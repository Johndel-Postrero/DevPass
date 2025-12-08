<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'course_id' => '1',
                'course_code' => 'BSCE',
                'course_name' => 'Bachelor of Science in Civil Engineering',
                'description' => '',
            ],
            [
                'course_id' => '2',
                'course_code' => 'BSCpE',
                'course_name' => 'Bachelor of Science in Computer Engineering',
                'description' => '',
            ],
            [
                'course_id' => '3',
                'course_code' => 'BSEE',
                'course_name' => 'Bachelor of Science in Electrical Engineering',
                'description' => '',
            ],
            [
                'course_id' => '4',
                'course_code' => 'BSECE',
                'course_name' => 'Bachelor of Science in Electronics Engineering',
                'description' => '',
            ],
            [
                'course_id' => '5',
                'course_code' => 'BSME',
                'course_name' => 'Bachelor of Science in Mechanical Engineering',
                'description' => '',
            ],
            [
                'course_id' => '6',
                'course_code' => 'BSCS',
                'course_name' => 'Bachelor of Science in Computer Science',
                'description' => '',
            ],
            [
                'course_id' => '7',
                'course_code' => 'BSIT',
                'course_name' => 'Bachelor of Science in Information Technology',
                'description' => '',
            ],
            [
                'course_id' => '8',
                'course_code' => 'BSIS',
                'course_name' => 'Bachelor of Science in Information Systems',
                'description' => '',
            ],
            [
                'course_id' => '9',
                'course_code' => 'BSA',
                'course_name' => 'Bachelor of Science in Accountancy',
                'description' => '',
            ],
            [
                'course_id' => '10',
                'course_code' => 'BSMA',
                'course_name' => 'Bachelor of Science in Management Accounting',
                'description' => '',
            ],
            [
                'course_id' => '11',
                'course_code' => 'BSBA-MM',
                'course_name' => 'BSBA Major in Marketing Management',
                'description' => '',
            ],
            [
                'course_id' => '12',
                'course_code' => 'BSBA-HRM',
                'course_name' => 'BSBA Major in Human Resource Management',
                'description' => '',
            ],
            [
                'course_id' => '13',
                'course_code' => 'BSEd',
                'course_name' => 'Bachelor of Secondary Education',
                'description' => '',
            ],
            [
                'course_id' => '14',
                'course_code' => 'BSN',
                'course_name' => 'Bachelor of Science in Nursing',
                'description' => '',
            ],
            [
                'course_id' => '15',
                'course_code' => 'BSCrim',
                'course_name' => 'Bachelor of Science in Criminology',
                'description' => '',
            ],
            [
                'course_id' => '16',
                'course_code' => 'BSMT',
                'course_name' => 'Bachelor of Science in Marine Transportation',
                'description' => '',
            ],
            [
                'course_id' => '17',
                'course_code' => 'BSMarE',
                'course_name' => 'Bachelor of Science in Marine Engineering',
                'description' => '',
            ],
            [
                'course_id' => '18',
                'course_code' => 'BS-Psych',
                'course_name' => 'Bachelor of Science in Psychology',
                'description' => '',
            ],
            [
                'course_id' => '19',
                'course_code' => 'BSPharm',
                'course_name' => 'Bachelor of Science in Pharmacy',
                'description' => '',
            ],
        ];

        DB::table('course')->insert($courses);
    }
}