<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
    h1 { font-size: 18px; margin: 0 0 10px 0; }
    .meta { margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 6px; vertical-align: top; }
    th { background: #eee; }
    ul { margin: 0; padding-left: 16px; }
  </style>
</head>
<body>
  <h1>Reporte de Alumnos y Responsables</h1>
  <div class="meta">
    Generado: {{ $generatedAt }} <br>
    Usuario: {{ $user->email }} ({{ $user->tipo }})
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Alumno</th>
        <th>Escuela</th>
        <th>Dirección</th>
        <th>Teléfono</th>
        <th>Ubicación</th>
        <th>Responsables</th>
      </tr>
    </thead>
    <tbody>
      @foreach($alumnos as $a)
        <tr>
          <td>{{ $a->id_alumno }}</td>
          <td>{{ $a->nombre_completo }}</td>
          <td>{{ optional($a->school)->nombre }}</td>
          <td>{{ $a->direccion }}</td>
          <td>{{ $a->telefono }}</td>
          <td>{{ $a->latitud }}, {{ $a->longitud }}</td>
          <td>
            @if($a->padres && $a->padres->count())
              <ul>
                @foreach($a->padres as $p)
                  <li>
                    {{ $p->nombre }} ({{ $p->pivot->parentesco ?? 'Responsable' }})
                    @if($p->telefono) - {{ $p->telefono }} @endif
                  </li>
                @endforeach
              </ul>
            @else
              Sin responsables
            @endif
          </td>
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>