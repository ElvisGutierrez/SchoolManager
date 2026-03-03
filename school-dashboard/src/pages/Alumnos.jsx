import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const mapContainerStyle = { width: "100%", height: "320px" };

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    nombre_completo: "",
    direccion: "",
    telefono: "",
    email: "",
    foto: "",
    genero: "Masculino",
    latitud: null,
    longitud: null,
    id_grado: "",
    id_seccion: "",
    id_school: "",
    padres: [{ nombre: "", direccion: "", telefono: "", parentesco: "Padre" }],
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.tipo === "Administrador";

  const defaultCenter = useMemo(() => ({ lat: 13.69294, lng: -89.21819 }), []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",

    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resAlumnos, resGrados, resSecciones] = await Promise.all([
        api.get("/alumnos"),
        api.get("/grados"),
        api.get("/secciones"),
      ]);

      setAlumnos(resAlumnos.data || []);
      setGrados(resGrados.data || []);
      setSecciones(resSecciones.data || []);

      if (isAdmin) {
        const resSchools = await api.get("/schools");
        setSchools(resSchools.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre_completo: "",
      direccion: "",
      telefono: "",
      email: "",
      foto: "",
      genero: "Masculino",
      latitud: null,
      longitud: null,
      id_grado: "",
      id_seccion: "",
      id_school: isAdmin ? "" : "",
      padres: [
        { nombre: "", direccion: "", telefono: "", parentesco: "Padre" },
      ],
    });
    setOpen(true);
  };

  const openEdit = (a) => {
    const padres = (a.padres &&
      a.padres.map((p) => ({
        nombre: p.nombre ?? "",
        direccion: p.direccion ?? "",
        telefono: p.telefono ?? "",
        parentesco: p.parentesco ?? p.pivot?.parentesco ?? "Responsable",
        id_padre: p.id_padre ?? null,
      }))) || [
      { nombre: "", direccion: "", telefono: "", parentesco: "Padre" },
    ];

    setEditing(a);
    setForm({
      nombre_completo: a.nombre_completo ?? "",
      direccion: a.direccion ?? "",
      telefono: a.telefono ?? "",
      email: a.email ?? "",
      foto: a.foto ?? "",
      genero: a.genero ?? "Masculino",
      latitud: a.latitud ? Number(a.latitud) : null,
      longitud: a.longitud ? Number(a.longitud) : null,
      id_grado: a.id_grado ?? "",
      id_seccion: a.id_seccion ?? "",
      id_school: a.id_school ?? (isAdmin ? "" : ""),
      padres,
    });
    setOpen(true);
  };

  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setForm((prev) => ({ ...prev, latitud: lat, longitud: lng }));
  };

  const addPadre = () => {
    setForm((prev) => ({
      ...prev,
      padres: [
        ...prev.padres,
        { nombre: "", direccion: "", telefono: "", parentesco: "Responsable" },
      ],
    }));
  };

  const removePadre = (index) => {
    setForm((prev) => ({
      ...prev,
      padres: prev.padres.filter((_, i) => i !== index),
    }));
  };

  const updatePadre = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      padres: prev.padres.map((p, i) =>
        i === index ? { ...p, [key]: value } : p,
      ),
    }));
  };

  const save = async () => {
    if (!form.nombre_completo.trim())
      return alert("Nombre completo es obligatorio");
    if (!form.id_grado) return alert("Seleccione grado");
    if (!form.id_seccion) return alert("Seleccione sección");
    if (isAdmin && !form.id_school) return alert("Seleccione la escuela");

    try {
      const payload = {
        nombre_completo: form.nombre_completo,
        direccion: form.direccion,
        telefono: form.telefono,
        email: form.email,
        foto: form.foto,
        genero: form.genero,
        latitud: form.latitud,
        longitud: form.longitud,
        id_grado: form.id_grado ? Number(form.id_grado) : null,
        id_seccion: form.id_seccion ? Number(form.id_seccion) : null,
        ...(isAdmin ? { id_school: Number(form.id_school) } : {}),
        padres: form.padres
          .filter((p) => p.nombre && p.nombre.trim())
          .map((p) => ({
            id_padre: p.id_padre ?? null,
            nombre: p.nombre,
            direccion: p.direccion,
            telefono: p.telefono,
            parentesco: p.parentesco,
          })),
      };

      if (editing) {
        await api.put(`/alumnos/${editing.id_alumno}`, payload);
      } else {
        await api.post("/alumnos", payload);
      }

      setOpen(false);
      await fetchAll();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        "Error guardando alumno";
      alert(msg);
    }
  };

  const remove = async (a) => {
    if (!confirm(`¿Eliminar alumno "${a.nombre_completo}"?`)) return;
    try {
      await api.delete(`/alumnos/${a.id_alumno}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No se pudo eliminar");
    }
  };

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <h2 style={{ margin: 0 }}>Alumnos</h2>
        <button
          onClick={openCreate}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            backgroundColor: "green",
            width: "150px",
          }}
        >
          + Nuevo alumno
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <div style={{ background: "white", borderRadius: 12, padding: 12 }}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  minWidth: 900,
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      ID
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Nombre
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Dirección
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Teléfono
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Grado
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Sección
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {alumnos.map((a) => (
                    <tr key={a.id_alumno}>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {a.id_alumno}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {a.nombre_completo}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {a.direccion || "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {a.telefono || "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {a.grado?.nombre ?? a.id_grado ?? "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {a.seccion?.nombre ?? a.id_seccion ?? "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => openEdit(a)}
                            style={{
                              backgroundColor: "blue",
                              color: "white",
                              cursor: "pointer",
                              width: "110px",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px",
                              fontWeight: 700,
                            }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => remove(a)}
                            style={{
                              backgroundColor: "red",
                              color: "white",
                              cursor: "pointer",
                              width: "110px",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px",
                              fontWeight: 700,
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {alumnos.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 12, color: "#6b7280" }}>
                        No hay alumnos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 50,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              width: "min(980px, calc(100% - 32px))",
              background: "white",
              borderRadius: 14,
              padding: 14,
              maxHeight: "90vh",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>
                {editing ? "Editar alumno" : "Nuevo alumno"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{ cursor: "pointer" }}
              >
                X
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 12,
              }}
            >
              <div>
                <label>Nombre completo *</label>
                <input
                  value={form.nombre_completo}
                  onChange={(e) =>
                    setForm({ ...form, nombre_completo: e.target.value })
                  }
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </div>

              <div>
                <label>Género</label>
                <select
                  value={form.genero}
                  onChange={(e) => setForm({ ...form, genero: e.target.value })}
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label>Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label>Dirección</label>
                <input
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </div>

              <div>
                <label>Grado *</label>
                <select
                  value={form.id_grado}
                  onChange={(e) =>
                    setForm({ ...form, id_grado: e.target.value })
                  }
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                >
                  <option value="">-- Seleccionar --</option>
                  {grados.map((g) => (
                    <option key={g.id_grado} value={g.id_grado}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Sección *</label>
                <select
                  value={form.id_seccion}
                  onChange={(e) =>
                    setForm({ ...form, id_seccion: e.target.value })
                  }
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                >
                  <option value="">-- Seleccionar --</option>
                  {secciones.map((s) => (
                    <option key={s.id_seccion} value={s.id_seccion}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Escuela *</label>
                  <select
                    value={form.id_school}
                    onChange={(e) =>
                      setForm({ ...form, id_school: e.target.value })
                    }
                    style={{ width: "100%", padding: 10, marginTop: 6 }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {schools.map((sc) => (
                      <option key={sc.id_school} value={sc.id_school}>
                        {sc.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ marginBottom: 6, color: "#374151" }}>
                  Selecciona ubicación en el mapa (click):
                </div>

                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={
                      form.latitud && form.longitud
                        ? { lat: form.latitud, lng: form.longitud }
                        : defaultCenter
                    }
                    zoom={13}
                    onClick={onMapClick}
                  >
                    {form.latitud && form.longitud && (
                      <Marker
                        position={{ lat: form.latitud, lng: form.longitud }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div>Cargando mapa...</div>
                )}

                <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                  Lat: {form.latitud ?? "-"} | Lng: {form.longitud ?? "-"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: 0 }}>Responsables (Padres)</h4>
                <button
                  onClick={addPadre}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  + Agregar padre
                </button>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {form.padres.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <div>
                        <label>Nombre *</label>
                        <input
                          value={p.nombre}
                          onChange={(e) =>
                            updatePadre(idx, "nombre", e.target.value)
                          }
                          style={{ width: "100%", padding: 10, marginTop: 6 }}
                        />
                      </div>

                      <div>
                        <label>Parentesco</label>
                        <input
                          value={p.parentesco}
                          onChange={(e) =>
                            updatePadre(idx, "parentesco", e.target.value)
                          }
                          style={{ width: "100%", padding: 10, marginTop: 6 }}
                        />
                      </div>

                      <div>
                        <label>Teléfono</label>
                        <input
                          value={p.telefono}
                          onChange={(e) =>
                            updatePadre(idx, "telefono", e.target.value)
                          }
                          style={{ width: "100%", padding: 10, marginTop: 6 }}
                        />
                      </div>

                      <div>
                        <label>Dirección</label>
                        <input
                          value={p.direccion}
                          onChange={(e) =>
                            updatePadre(idx, "direccion", e.target.value)
                          }
                          style={{ width: "100%", padding: 10, marginTop: 6 }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => removePadre(idx)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                          background: "white",
                          cursor: "pointer",
                          borderColor: "#ef4444",
                          color: "#ef4444",
                        }}
                      >
                        Quitar
                      </button>
                    </div>

                    <div
                      style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}
                    >
                      * Si el nombre está vacío, ese padre no se enviará.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 12,
              }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{ cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button onClick={save} style={{ cursor: "pointer" }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
