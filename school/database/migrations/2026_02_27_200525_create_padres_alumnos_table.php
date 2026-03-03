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
        Schema::create('padres_alumnos', function (Blueprint $table) {
            $table->id('id_padre_alumno');

            $table->unsignedBigInteger('id_alumno');
            $table->unsignedBigInteger('id_padre');
            $table->string('parentesco', 50);

            $table->foreign('id_alumno')
                ->references('id_alumno')->on('alumnos')
                ->onUpdate('cascade')
                ->cascadeOnDelete();

            $table->foreign('id_padre')
                ->references('id_padre')->on('padres')
                ->onUpdate('cascade')
                ->cascadeOnDelete();

            $table->unique(['id_alumno', 'id_padre']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('padres_alumnos');
    }
};
