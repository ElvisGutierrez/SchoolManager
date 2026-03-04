import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const mapContainerStyle = { width: "100%", height: "320px" };

export default function Schools() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.tipo === "Administrador";

  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    email: "",
    foto: "",
    latitud: null,
    longitud: null,
    user_id: "",
  });

  const defaultCenter = useMemo(() => ({ lat: 13.69294, lng: -89.21819 }), []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get("/schools");
      setSchools(res.data || []);

      if (isAdmin) {
        const resUsers = await api.get("/users");
        setUsers(resUsers.data || []);
      } else {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre: "",
      direccion: "",
      email: "",
      foto: null,
      /* foto: "", */
      latitud: null,
      longitud: null,
      user_id: "",
    });
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      nombre: s.nombre ?? "",
      direccion: s.direccion ?? "",
      email: s.email ?? "",
      foto: null,
      /* foto: s.foto ?? "", */
      latitud: s.latitud ? Number(s.latitud) : null,
      longitud: s.longitud ? Number(s.longitud) : null,
      user_id: s.user_id ? String(s.user_id) : "",
    });
    setOpen(true);
  };

  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setForm((prev) => ({ ...prev, latitud: lat, longitud: lng }));
  };

  const save = async () => {
    if (!form.nombre.trim()) return alert("Nombre es obligatorio");

    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email)) {
        return alert("El email no tiene un formato válido");
      }
    }

    if (form.foto) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(form.foto.type)) {
        return alert("La foto debe ser JPG o PNG");
      }

      if (form.foto.size > 2 * 1024 * 1024) {
        return alert("La imagen no puede ser mayor a 2MB");
      }
    }

    const fd = new FormData();
    fd.append("nombre", form.nombre);
    fd.append("direccion", form.direccion || "");
    fd.append("email", form.email || "");
    fd.append("latitud", form.latitud ?? "");
    fd.append("longitud", form.longitud ?? "");

    if (form.foto instanceof File) {
      fd.append("foto", form.foto);
    }

    if (isAdmin && form.user_id) {
      fd.append("user_id", String(form.user_id));
    }
    /* console.log("FOTO:", form.foto, form.foto instanceof File); */
    try {
      if (editing) {
        await api.post(`/schools/${editing.id_school}?_method=PUT`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/schools", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setOpen(false);
      await fetchSchools();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        "Error guardando escuela";
      alert(msg);
    }
  };

  //este pa la foto Url
  /* const save = async () => {
    if (!form.nombre.trim()) return alert("Nombre es obligatorio");

    const payload = {
      nombre: form.nombre,
      direccion: form.direccion,
      email: form.email,
      foto: form.foto,
      latitud: form.latitud,
      longitud: form.longitud,
      ...(isAdmin && form.user_id ? { user_id: Number(form.user_id) } : {}),
    };

    try {
      if (editing) {
        await api.put(`/schools/${editing.id_school}`, payload);
      } else {
        await api.post("/schools", payload);
      }
      setOpen(false);
      await fetchSchools();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        "Error guardando escuela";
      alert(msg);
    }
  };
 */
  const remove = async (s) => {
    if (!confirm(`¿Eliminar "${s.nombre}"?`)) return;
    try {
      await api.delete(`/schools/${s.id_school}`);
      await fetchSchools();
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo eliminar");
    }
  };

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <h2 style={{ margin: 0 }}>Escuelas</h2>
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
          + Nueva escuela
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
                  minWidth: 800,
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
                      Email
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Coordenadas
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Foto
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {schools.map((s) => (
                    <tr key={s.id_school}>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {s.id_school}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {s.nombre}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {s.direccion || "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {s.email || "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {s.latitud && s.longitud
                          ? `${s.latitud}, ${s.longitud}`
                          : "-"}
                      </td>
                      <td>
                        {s.foto ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${s.foto}`}
                            style={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => openEdit(s)}
                            style={{
                              backgroundColor: "blue",
                              color: "white",
                              cursor: "pointer",
                              width: "110px",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px",
                            }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => remove(s)}
                            style={{
                              backgroundColor: "red",
                              color: "white",
                              cursor: "pointer",
                              width: "110px",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px",
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {schools.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12, color: "#6b7280" }}>
                        No hay escuelas
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
                {editing ? "Editar escuela" : "Nueva escuela"}
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
                <label>Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
              {isAdmin && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Usuario encargado</label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={form.user_id}
                      onChange={(e) =>
                        setForm({ ...form, user_id: e.target.value })
                      }
                      style={{ width: "100%", padding: 10, marginTop: 6 }}
                    >
                      <option value={String(user.id)}>
                        -- Administrador --
                      </option>

                      {users
                        .filter((u) => u.tipo === "Usuario")
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre} ({u.usuario})
                          </option>
                        ))}
                    </select>

                    {/* <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, user_id: String(user.id) })
                      }
                      style={{
                        marginTop: 6,
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Asignarme a mí
                    </button> */}
                  </div>
                </div>
              )}

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

              <div style={{ gridColumn: "1 / -1" }}>
                <label>Foto </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, foto: e.target.files?.[0] || null })
                  }
                />
                {/* <input
                  value={form.foto}
                  onChange={(e) => setForm({ ...form, foto: e.target.value })}
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                /> */}
              </div>

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
