import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Padres() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.tipo === "Administrador";

  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
  });

  const fetchPadres = async () => {
    setLoading(true);
    try {
      const res = await api.get("/padres");
      setPadres(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPadres();
  }, []);

  /* const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", direccion: "", telefono: "" });
    setOpen(true);
  }; */

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nombre: p.nombre ?? "",
      direccion: p.direccion ?? "",
      telefono: p.telefono ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.nombre.trim()) return alert("Nombre es obligatorio");

    if (!form.nombre || form.nombre.trim().length < 3) {
      return alert("El nombre debe tener al menos 3 caracteres");
    }

    if (form.direccion && form.direccion.trim().length < 5) {
      return alert("La dirección es demasiado corta");
    }

    if (form.telefono) {
      const telefonoRegex = /^[0-9]{8}$/;

      if (!telefonoRegex.test(form.telefono)) {
        return alert("El teléfono debe tener 8 números");
      }
    }

    try {
      if (editing) {
        await api.put(`/padres/${editing.id_padre}`, form);
      } else {
        await api.post("/padres", form);
      }
      setOpen(false);
      await fetchPadres();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        "Error guardando padre";
      alert(msg);
    }
  };

  const remove = async (p) => {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await api.delete(`/padres/${p.id_padre}`);
      await fetchPadres();
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo eliminar");
    }
  };

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <h2 style={{ margin: 0 }}>Padres</h2>

        {/* <button
          onClick={openCreate}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            backgroundColor: "green",
            width: "150px",
          }}
        >
          + Nuevo padre
        </button> */}
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <div style={{ background: "white", borderRadius: 12, padding: 12 }}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  minWidth: 700,
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
                      Alumnos
                    </th>

                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {padres.map((p) => (
                    <tr key={p.id_padre}>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {p.id_padre}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {p.nombre}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {p.direccion || "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {p.telefono || "-"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {p.alumnos?.length ? (
                          <div style={{ display: "grid", gap: 6 }}>
                            {p.alumnos.map((a) => (
                              <div
                                key={a.id_alumno}
                                style={{
                                  background: "#f3f4f6",
                                  padding: "6px 8px",
                                  borderRadius: 8,
                                  display: "inline-flex",
                                  gap: 8,
                                  alignItems: "center",
                                  width: "fit-content",
                                }}
                              >
                                <span style={{ fontWeight: 700 }}>
                                  {a.nombre_completo}
                                </span>
                                <span
                                  style={{ fontSize: 12, color: "#6b7280" }}
                                >
                                  ({a.pivot?.parentesco || "—"})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#6b7280" }}>—</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => openEdit(p)}
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

                          {isAdmin && (
                            <button
                              onClick={() => remove(p)}
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
                          )}

                          {/* <button
                            onClick={() => remove(p)}
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
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {padres.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12, color: "#6b7280" }}>
                        No hay padres
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
              width: "min(700px, 100%)",
              background: "white",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>
                {editing ? "Editar padre" : "Nuevo padre"}
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
              <div style={{ gridColumn: "1 / -1" }}>
                <label>Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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

              <div style={{ gridColumn: "1 / -1" }}>
                <label>Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
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
