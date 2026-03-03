<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\School;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    // GET /api/reports/schools
    public function schools(Request $request)
    {
        $user = $request->user();

        $query = School::query()
            ->with('user:id,nombre,email')
            ->orderBy('id_school', 'desc');

        // Usuario
        if ($user->tipo !== 'Administrador') {
            $query->where('user_id', $user->id);
        }

        $schools = $query->get();

        $pdf = Pdf::loadView('reports.schools', [
            'schools' => $schools,
            'generatedAt' => now(),
            'user' => $user,
        ]);

        return $pdf->download('reporte_escuelas.pdf');
    }

    // GET /api/reports/alumnos
    public function alumnos(Request $request)
    {
        $user = $request->user();

        $query = Alumno::query()
            ->with([
                'school:id_school,nombre,user_id',
                'padres:id_padre,nombre,telefono',
            ])
            ->orderBy('id_alumno', 'desc');

        // Usuario
        if ($user->tipo !== 'Administrador') {
            $query->whereHas('school', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $alumnos = $query->get();

        $pdf = Pdf::loadView('reports.alumnos', [
            'alumnos' => $alumnos,
            'generatedAt' => now(),
            'user' => $user,
        ]);

        return $pdf->download('reporte_alumnos_responsables.pdf');
    }
}
