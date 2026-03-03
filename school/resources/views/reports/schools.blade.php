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
  </style>
</head>
<body>
  <h1>Reporte de Escuelas</h1>
  <div class="meta">
    Generado: {{ $generatedAt }} <br>
    Usuario: {{ $user->email }} ({{ $user->tipo }})
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Dirección</th>
        <th>Email</th>
        <th>Lat</th>
        <th>Lng</th>
        <th>Propietario</th>
      </tr>
    </thead>
    <tbody>
      @foreach($schools as $s)
        <tr>
          <td>{{ $s->id_school }}</td>
          <td>{{ $s->nombre }}</td>
          <td>{{ $s->direccion }}</td>
          <td>{{ $s->email }}</td>
          <td>{{ $s->latitud }}</td>
          <td>{{ $s->longitud }}</td>
          <td>
            {{ optional($s->user)->nombre }} <br>
            {{ optional($s->user)->email }}
          </td>
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>