<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alumnos', function (Blueprint $table) {
            $table->id('id_alumno');
            $table->string('nombre_completo', 150);
            $table->string('direccion', 255)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('foto', 255)->nullable();
            $table->enum('genero', ['Masculino', 'Femenino'])->nullable();
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();

            $table->unsignedBigInteger('id_grado')->nullable();
            $table->unsignedBigInteger('id_seccion')->nullable();

            $table->unsignedBigInteger('id_school');

            $table->foreign('id_grado')
                ->references('id_grado')->on('grados')
                ->onUpdate('cascade')
                ->nullOnDelete();

            $table->foreign('id_seccion')
                ->references('id_seccion')->on('secciones')
                ->onUpdate('cascade')
                ->nullOnDelete();

            $table->foreign('id_school')
                ->references('id_school')->on('schools')
                ->onUpdate('cascade')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumnos');
    }
};
