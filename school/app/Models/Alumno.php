<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Padre;


class Alumno extends Model
{
    //
    protected $primaryKey = 'id_alumno';

    protected $fillable = [
        'nombre_completo','direccion','telefono','email','foto','genero',
        'latitud','longitud','id_grado','id_seccion','id_school'
    ];

    public function school()
    {
        return $this->belongsTo(School::class, 'id_school', 'id_school');
    }

    public function padres()
    {
        return $this->belongsToMany(
            Padre::class,
            'padres_alumnos',
            'id_alumno',
            'id_padre'
        )->withPivot('parentesco')->withTimestamps();
    }

    public function grado()
    {
        return $this->belongsTo(Grado::class, 'id_grado', 'id_grado');
    }

    public function seccion()
    {
        return $this->belongsTo(Seccion::class, 'id_seccion', 'id_seccion');
    }
}
