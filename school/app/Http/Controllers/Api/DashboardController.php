<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Alumno;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function mapData(Request $request)
    {
        $user = $request->user();

        // Admin
        if ($user->tipo === 'Administrador') {

            $schools = School::select('id_school','nombre','latitud','longitud')
                ->whereNotNull('latitud')
                ->get();

            $alumnos = Alumno::select('id_alumno','nombre_completo','latitud','longitud')
                ->whereNotNull('latitud')
                ->get();

            return response()->json([
                'schools' => $schools,
                'alumnos' => $alumnos
            ]);
        }

        // Usuario
        $school = School::where('user_id', $user->id)
            ->select('id_school','nombre','latitud','longitud')
            ->first();

        $schools = $school ? [$school] : [];

        $alumnos = Alumno::select('id_alumno','nombre_completo','latitud','longitud')
            ->where('id_school', $school?->id_school)
            ->whereNotNull('latitud')
            ->get();

        return response()->json([
            'schools' => $schools,
            'alumnos' => $alumnos
        ]);
    }
}
