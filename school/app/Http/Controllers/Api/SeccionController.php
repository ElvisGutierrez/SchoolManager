<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seccion;

class SeccionController extends Controller
{
    public function index()
    {
        return Seccion::orderBy('id_seccion')->get();
    }
}