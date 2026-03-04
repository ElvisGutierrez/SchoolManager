<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    // GET /api/schools
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->tipo === 'Administrador') {
            return School::orderBy('id_school', 'desc')->get();
        }

        return School::where('user_id', $user->id)
            ->orderBy('id_school', 'desc')
            ->get();
    }

    // POST /api/schools
    public function store(Request $request)
    {
        $auth = $request->user();

        $data = $request->validate([
            'nombre' => ['required','string','min:3','max:150'],
            'direccion' => ['nullable','string','max:255'],
            'email' => ['nullable','email','max:100'],
            'foto' => ['nullable','image','max:2048'],
            /* 'foto' => ['nullable','url','max:255'], */
            'latitud' => ['nullable','numeric'],
            'longitud' => ['nullable','numeric'],
            'user_id' => ['nullable','exists:users,id'],
            ]);

        $data['user_id'] = $data['user_id'] ?? $auth->id;

         if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('schools', 'public');
            $data['foto'] = $path; 
        }

        return School::create($data);
    }

    // GET /api/schools/{id}
    public function show(Request $request, $id)
    {
        $school = School::findOrFail($id);
        $user = $request->user();

        if ($user->tipo !== 'Administrador' && $school->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return $school;
    }

    // PUT /api/schools/{id}
    public function update(Request $request, $id)
    {
        $school = School::findOrFail($id);
        $user = $request->user();

        if ($user->tipo !== 'Administrador' && $school->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'nombre' => ['sometimes','required','string','min:3','max:150'],
            'direccion' => ['nullable','string','max:255'],
            'email' => ['nullable','email','max:100'],
            'foto' => ['nullable','image','max:2048'],
            /* 'foto' => ['nullable','url','max:255'], */
            'latitud' => ['nullable','numeric'],
            'longitud' => ['nullable','numeric'],
            'user_id' => ['nullable','exists:users,id'],
            ]);

        if ($user->tipo !== 'Administrador') {
            unset($data['user_id']);
        }

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('schools', 'public');
            $data['foto'] = $path;
        }

        $school->update($data);
        return $school;
    }

    // DELETE /api/schools/{id} 
    public function destroy(Request $request, $id)
    {
        $school = School::findOrFail($id);

        $school->delete();
        return response()->json(['message' => 'Eliminado']);
    }
}
