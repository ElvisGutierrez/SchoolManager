<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Padre;
use Illuminate\Http\Request;

class PadreController extends Controller
{
    // GET /api/padres
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Padre::query()->orderBy('id_padre', 'desc');

        if ($user->tipo !== 'Administrador') {
            $query->whereHas('alumnos.school', function ($q) use ($user) {
                $q->where('schools.user_id', $user->id);
            });

            $query->with(['alumnos' => function ($q) use ($user) {
                $q->select('alumnos.id_alumno', 'alumnos.nombre_completo')
                ->whereHas('school', function ($s) use ($user) {
                    $s->where('schools.user_id', $user->id);
                })
                ->withPivot('parentesco');
            }]);

            return $query->get();
        }

        return $query->with(['alumnos' => function ($q) {
            $q->select('alumnos.id_alumno', 'alumnos.nombre_completo')
            ->withPivot('parentesco');
        }])->get();
    }

    // POST /api/padres
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required','string','max:150'],
            'direccion' => ['nullable','string','max:255'],
            'telefono' => ['nullable','string','max:20'],
        ]);

        return Padre::create($data);
    }

    // GET /api/padres/{id}
    public function show($id)
    {
        return Padre::findOrFail($id);
    }

    // PUT /api/padres/{id}
    public function update(Request $request, $id)
    {
        $padre = Padre::findOrFail($id);

        $data = $request->validate([
            'nombre' => ['sometimes','required','string','max:150'],
            'direccion' => ['nullable','string','max:255'],
            'telefono' => ['nullable','string','max:20'],
        ]);

        $padre->update($data);
        return $padre;
    }

    // DELETE /api/padres/{id}
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->tipo !== 'Administrador') {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }
        
        $padre = Padre::findOrFail($id);
        $padre->delete();

        return response()->json(['message' => 'Padre eliminado']);
    }
}