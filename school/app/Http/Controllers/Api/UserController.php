<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
    {
    public function index()
    {
    return User::select('id','nombre','usuario','email','tipo')
        ->orderBy('nombre')
        ->get();
    }

    public function show($id)
    {
    return User::select('id','nombre','usuario','email','tipo')
        ->findOrFail($id);
    }

    public function store(Request $request)
    {
    $data = $request->validate([
        'nombre' => ['required','string','max:100'],
        'usuario' => ['required','string','max:50','unique:users,usuario'],
        'email' => ['required','email','unique:users,email'],
        'password' => ['required','string','min:6'],
        'tipo' => ['required', Rule::in(['Administrador','Usuario'])],
    ]);

    $data['password'] = bcrypt($data['password']);
    return User::create($data)->only(['id','nombre','usuario','email','tipo']);
    }

    public function update(Request $request, $id)
    {
    $u = User::findOrFail($id);

    $data = $request->validate([
        'nombre' => ['sometimes','required','string','max:100'],
        'usuario' => ['sometimes','required','string','max:50', Rule::unique('users','usuario')->ignore($u->id)],
        'email' => ['sometimes','required','email', Rule::unique('users','email')->ignore($u->id)],
        'password' => ['nullable','string','min:6'],
        'tipo' => ['sometimes','required', Rule::in(['Administrador','Usuario'])],
    ]);

    if (!empty($data['password'])) {
        $data['password'] = bcrypt($data['password']);
    } else {
        unset($data['password']);
    }

    $u->update($data);
    return $u->only(['id','nombre','usuario','email','tipo']);
    }

    public function destroy($id)
    {
    $u = User::findOrFail($id);
    $u->delete();
    return response()->json(['message' => 'Eliminado']);
    }
}