<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Alumno;
use App\Models\User;

class School extends Model
{
    //
    protected $primaryKey = 'id_school';

    protected $fillable = [
        'nombre','direccion','email','foto','latitud','longitud','user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function alumnos()
    {
        return $this->hasMany(Alumno::class, 'id_school', 'id_school');
    }
}
