<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GradosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('grados')->insert([
            ['nombre' => '1°'],
            ['nombre' => '2°'],
            ['nombre' => '3°'],
            ['nombre' => '4°'],
            ['nombre' => '5°'],
            ['nombre' => '6°'],
            ['nombre' => '7°'],
            ['nombre' => '8°'],
            ['nombre' => '9°'],
        ]);
    }
}
