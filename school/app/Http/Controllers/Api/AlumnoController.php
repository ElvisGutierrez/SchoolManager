<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Padre;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AlumnoController extends Controller
{
    // GET /api/alumnos
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Alumno::with(['padres', 'school', 'grado', 'seccion'])
            ->orderBy('id_alumno', 'desc');

        if ($user->tipo !== 'Administrador') {
            $query->whereHas('school', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        return $query->get();
    }

    // POST /api/alumnos
    public function store(Request $request)
    {
        $user = $request->user();

        $rulesBase = [
            'nombre_completo' => ['required','string','max:150'],
            'direccion' => ['nullable','string','max:255'],
            'telefono' => ['nullable','string','max:20'],
            'email' => ['nullable','string','max:100'],
            'foto' => ['nullable','string','max:255'],
            'genero' => ['nullable','in:Masculino,Femenino'],
            'latitud' => ['nullable','numeric'],
            'longitud' => ['nullable','numeric'],
            'id_grado' => ['nullable','exists:grados,id_grado'],
            'id_seccion' => ['nullable','exists:secciones,id_seccion'],

            // Padres
            'padres' => ['nullable','array'],
            'padres.*.id_padre' => ['nullable','exists:padres,id_padre'],
            'padres.*.nombre' => ['required_with:padres','string','max:150'],
            'padres.*.direccion' => ['nullable','string','max:255'],
            'padres.*.telefono' => ['nullable','string','max:20'],
            'padres.*.parentesco' => ['required_with:padres','string','max:50'],
        ];

        // Admin
        if ($user->tipo === 'Administrador') {
            $data = $request->validate(array_merge($rulesBase, [
                'id_school' => ['required','exists:schools,id_school'],
            ]));
        } else {
            $data = $request->validate($rulesBase);

            $schoolId = School::where('user_id', $user->id)->value('id_school');
            if (!$schoolId) {
                return response()->json(['message' => 'No tienes una escuela asignada'], 422);
            }

            $data['id_school'] = $schoolId;
        }

        return DB::transaction(function () use ($data) {

            $padresData = $data['padres'] ?? [];
            unset($data['padres']);

            $alumno = Alumno::create($data);

            foreach ($padresData as $p) {

                $padre = null;

                if (!empty($p['id_padre'])) {
                    $padre = Padre::find($p['id_padre']);
                }

                if (!$padre) {
                    $padre = Padre::firstOrCreate(
                        [
                            'nombre' => $p['nombre'],
                            'telefono' => $p['telefono'] ?? null,
                        ],
                        [
                            'direccion' => $p['direccion'] ?? null,
                        ]
                    );
                } else {
                    $padre->update([
                        'nombre' => $p['nombre'],
                        'telefono' => $p['telefono'] ?? null,
                        'direccion' => $p['direccion'] ?? null,
                    ]);
                }

                $alumno->padres()->syncWithoutDetaching([
                    $padre->id_padre => ['parentesco' => $p['parentesco']],
                ]);
            }

            return Alumno::with(['padres','school','grado','seccion'])->find($alumno->id_alumno);
        });
    }

    // GET /api/alumnos/{id}
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $alumno = Alumno::with(['padres','school','grado','seccion'])->findOrFail($id);

        if ($user->tipo !== 'Administrador') {
            if ($alumno->school?->user_id !== $user->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
        }

        return $alumno;
    }

    // PUT /api/alumnos/{id}
    public function update(Request $request, $id)
    {
        $user = $request->user();

        $alumno = Alumno::with(['school', 'padres'])->findOrFail($id);

        if ($user->tipo !== 'Administrador' && $alumno->school?->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'nombre_completo' => ['sometimes','required','string','max:150'],
            'direccion' => ['nullable','string','max:255'],
            'telefono' => ['nullable','string','max:20'],
            'email' => ['nullable','string','max:100'],
            'foto' => ['nullable','string','max:255'],
            'genero' => ['nullable','in:Masculino,Femenino'],
            'latitud' => ['nullable','numeric'],
            'longitud' => ['nullable','numeric'],
            'id_grado' => ['nullable','exists:grados,id_grado'],
            'id_seccion' => ['nullable','exists:secciones,id_seccion'],

            // Padres
            'padres' => ['nullable','array'],
            'padres.*.id_padre' => ['nullable','exists:padres,id_padre'],
            'padres.*.nombre' => ['required_with:padres','string','max:150'],
            'padres.*.direccion' => ['nullable','string','max:255'],
            'padres.*.telefono' => ['nullable','string','max:20'],
            'padres.*.parentesco' => ['required_with:padres','string','max:50'],
        ]);

        return DB::transaction(function () use ($alumno, $data) {

            $padresData = $data['padres'] ?? null; 
            unset($data['padres']);

            $alumno->update($data);

            if (is_array($padresData)) {
                $syncData = [];

                foreach ($padresData as $p) {

                    $padre = null;

                    if (!empty($p['id_padre'])) {
                        $padre = Padre::find($p['id_padre']);
                    }

                    if (!$padre) {
                        $padre = Padre::firstOrCreate(
                            [
                                'nombre' => $p['nombre'],
                                'telefono' => $p['telefono'] ?? null,
                            ],
                            [
                                'direccion' => $p['direccion'] ?? null,
                            ]
                        );
                    } else {
                        $padre->update([
                            'nombre' => $p['nombre'],
                            'telefono' => $p['telefono'] ?? null,
                            'direccion' => $p['direccion'] ?? null,
                        ]);
                    }

                    $syncData[$padre->id_padre] = [
                        'parentesco' => $p['parentesco'],
                    ];
                }

                $alumno->padres()->sync($syncData);
            }

            return Alumno::with(['padres','school','grado','seccion'])->find($alumno->id_alumno);
        });
    }

    // DELETE /api/alumnos/{id}
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $alumno = Alumno::with('school')->findOrFail($id);

        if ($user->tipo !== 'Administrador' && $alumno->school?->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $alumno->padres()->detach();
        $alumno->delete();

        return response()->json(['message' => 'Eliminado']);
    }
}