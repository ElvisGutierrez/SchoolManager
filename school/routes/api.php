<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\AlumnoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\GradoController;
use App\Http\Controllers\Api\SeccionController;
use App\Http\Controllers\Api\PadreController;
use App\Http\Controllers\Api\UserController;


Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    //Login
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    //Login "Admin" testeo
    Route::get('/admin/ping', function () {
        return response()->json(['ok' => true, 'message' => 'Solo admin']);
    })->middleware('admin');

    //school
    Route::get('/schools', [SchoolController::class, 'index']);
    Route::get('/schools/{id}', [SchoolController::class, 'show']);
    Route::put('/schools/{id}', [SchoolController::class, 'update']);

    //school "Admin"
    Route::middleware('admin')->group(function () {
        Route::post('/schools', [SchoolController::class, 'store']);
        Route::delete('/schools/{id}', [SchoolController::class, 'destroy']);
    });

    //Alumnos
    Route::get('/alumnos', [AlumnoController::class, 'index']);
    Route::post('/alumnos', [AlumnoController::class, 'store']);
    Route::get('/alumnos/{id}', [AlumnoController::class, 'show']);
    Route::put('/alumnos/{id}', [AlumnoController::class, 'update']);
    Route::delete('/alumnos/{id}', [AlumnoController::class, 'destroy']);

    //padres
    Route::get('/padres', [PadreController::class, 'index']);
    Route::post('/padres', [PadreController::class, 'store']);
    Route::get('/padres/{id}', [PadreController::class, 'show']);
    Route::put('/padres/{id}', [PadreController::class, 'update']);
    Route::delete('/padres/{id}', [PadreController::class, 'destroy']);

    //Dashboard
    Route::get('/dashboard/map-data', [DashboardController::class, 'mapData']);

    //Reportes
    Route::get('/reports/schools', [ReportController::class, 'schools']);
    Route::get('/reports/alumnos', [ReportController::class, 'alumnos']);

    //Grados-Secciones
    Route::get('/grados', [GradoController::class, 'index']);
    Route::get('/secciones', [SeccionController::class, 'index']);

    //Usuarios
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});