<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grado;

class GradoController extends Controller
{
    public function index()
    {
        return Grado::orderBy('id_grado')->get();
    }
}