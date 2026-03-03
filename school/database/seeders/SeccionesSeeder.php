<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SeccionesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         DB::table('secciones')->insert([
            ['nombre' => 'A'],
            ['nombre' => 'B'],
            ['nombre' => 'C'],
        ]);
    }
}
