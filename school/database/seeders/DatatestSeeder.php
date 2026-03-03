<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\School;
use App\Models\Alumno;
use App\Models\Padre;
use App\Models\Grado;
use App\Models\Seccion;

class DatatestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'nombre' => 'Administrador',
                'usuario' => 'admin',
                'password' => Hash::make('123456'),
                'tipo' => 'Administrador',
            ]
        );

        $user = User::updateOrCreate(
            ['email' => 'user@test.com'],
            [
                'nombre' => 'Usuario',
                'usuario' => 'user',
                'password' => Hash::make('123456'),
                'tipo' => 'Usuario',
            ]
        );

        $schoolUser = School::create([
            'nombre' => 'Colegio San Miguel',
            'direccion' => 'Colonia Escalón, San Salvador',
            'email' => 'sanmiguel@test.com',
            'latitud' => 13.7002,
            'longitud' => -89.2105,
            'user_id' => $user->id,
        ]);

        $schoolAdmin = School::create([
            'nombre' => 'Instituto Nacional Centroamérica',
            'direccion' => 'San Salvador',
            'email' => 'inca@test.com',
            'latitud' => 13.6901,
            'longitud' => -89.2180,
            'user_id' => $admin->id,
        ]);

        $nombresAlumnos = [
            'Luis Martínez',
            'Ana López',
            'Kevin Ramírez',
            'María González'
        ];

        $nombresPadres = [
            'José Martínez',
            'Rosa Martínez',
            'Miguel López',
            'Patricia López',
            'Antonio Ramírez',
            'Claudia Ramírez',
            'Ricardo González',
            'Elena González'
        ];

        $escuelas = [$schoolUser, $schoolAdmin];
        $contadorAlumno = 0;
        $contadorPadre = 0;

        $grado = Grado::first();
        $seccion = Seccion::first();

        foreach ($escuelas as $school) {

            for ($i = 1; $i <= 2; $i++) {

                $nombreAlumno = $nombresAlumnos[$contadorAlumno++];

                $alumno = Alumno::create([
                    'nombre_completo' => $nombreAlumno,
                    'direccion' => 'Colonia Santa Elena',
                    'telefono' => '7' . rand(1000000, 9999999),
                    'email' => strtolower(str_replace(' ', '', $nombreAlumno)) . '@mail.com',
                    'genero' => rand(0,1) ? 'Masculino' : 'Femenino',
                    'latitud' => $school->latitud + (rand(-20,20) / 10000),
                    'longitud' => $school->longitud + (rand(-20,20) / 10000),
                    'id_grado' => $grado?->id_grado,
                    'id_seccion' => $seccion?->id_seccion,
                    'id_school' => $school->id_school,
                ]);

                $padre1 = Padre::create([
                    'nombre' => $nombresPadres[$contadorPadre++],
                    'direccion' => 'Colonia Santa Elena',
                    'telefono' => '6' . rand(1000000, 9999999),
                ]);

                $padre2 = Padre::create([
                    'nombre' => $nombresPadres[$contadorPadre++],
                    'direccion' => 'Colonia Santa Elena',
                    'telefono' => '6' . rand(1000000, 9999999),
                ]);

                $alumno->padres()->sync([
                    $padre1->id_padre => ['parentesco' => 'Padre'],
                    $padre2->id_padre => ['parentesco' => 'Madre'],
                ]);
            }
        }
    }
}