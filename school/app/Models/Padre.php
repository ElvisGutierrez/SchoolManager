<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Alumno;

class Padre extends Model
{
    protected $table = 'padres';
    protected $primaryKey = 'id_padre';

    protected $fillable = ['nombre','direccion','telefono'];

    public function alumnos()
    {
        return $this->belongsToMany(
            Alumno::class,
            'padres_alumnos',
            'id_padre',
            'id_alumno'
        )->withPivot('parentesco')->withTimestamps();
    }
}