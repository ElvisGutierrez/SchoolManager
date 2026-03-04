import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Users() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.tipo === "Administrador";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    email: "",
    password: "",
    tipo: "Usuario",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        "Error cargando usuarios";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre: "",
      usuario: "",
      email: "",
      password: "",
      tipo: "Usuario",
    });
    setOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      nombre: u.nombre ?? "",
      usuario: u.usuario ?? "",
      email: u.email ?? "",
      password: "",
      tipo: u.tipo ?? "Usuario",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.nombre.trim()) return alert("Nombre es obligatorio");
    if (!form.usuario.trim()) return alert("Usuario es obligatorio");
    if (!form.email.trim()) return alert("Email es obligatorio");

    if (!editing && !form.password.trim())
      return alert("Password es obligatorio para crear");

    const nombre = form.nombre.trim();
    const usuario = form.usuario.trim();
    const email = form.email.trim();
    const password = form.password;

    if (nombre.length < 3) {
      return alert("El nombre debe tener al menos 3 caracteres");
    }

    if (usuario.length < 3) {
      return alert("El usuario debe tener al menos 3 caracteres");
    }

    if (/\s/.test(usuario)) {
      return alert("El usuario no puede tener espacios");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return alert("Email inválido");
    }

    if (!editing) {
      if (!password || password.length < 6) {
        return alert("La contraseña debe tener mínimo 6 caracteres");
      }
    }

    if (editing && password && password.length < 6) {
      return alert("La contraseña debe tener mínimo 6 caracteres");
    }

    if (!["Usuario", "Administrador"].includes(form.tipo)) {
      return alert("Tipo de usuario inválido");
    }

    const payload = {
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      email: form.email.trim(),
      tipo: form.tipo,
      ...(form.password.trim() ? { password: form.password } : {}),
    };

    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
      } else {
        await api.post("/users", payload);
      }
      setOpen(false);
      await fetchUsers();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        "Error guardando usuario";
      alert(msg);
    }
  };

  const remove = async (u) => {
    if (u.id === user?.id) {
      return alert("No puedes eliminar tu propio usuario.");
    }
    if (!confirm(`¿Eliminar "${u.nombre}" (${u.usuario})?`)) return;

    try {
      await api.delete(`/users/${u.id}`);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo eliminar");
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: 12, background: "white", borderRadius: 12 }}>
        No autorizado (solo Administrador).
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <h2 style={{ margin: 0 }}>Usuarios</h2>

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
          + Nuevo usuario
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
                      Usuario
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Email
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Tipo
                    </th>
                    <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {u.id}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {u.nombre}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {u.usuario}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {u.email}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {u.tipo}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => openEdit(u)}
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
                            onClick={() => remove(u)}
                            style={{
                              backgroundColor: "red",
                              color: "white",
                              cursor: "pointer",
                              width: "110px",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px",
                              opacity: u.id === user?.id ? 0.6 : 1,
                            }}
                            disabled={u.id === user?.id}
                            title={
                              u.id === user?.id ? "No puedes eliminarte" : ""
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12, color: "#6b7280" }}>
                        No hay usuarios
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
              width: "min(780px, calc(100% - 32px))",
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
                {editing ? "Editar usuario" : "Nuevo usuario"}
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
                <label>Usuario *</label>
                <input
                  value={form.usuario}
                  onChange={(e) =>
                    setForm({ ...form, usuario: e.target.value })
                  }
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </div>

              <div>
                <label>Email *</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </div>

              <div>
                <label>Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                >
                  <option value="Usuario">Usuario</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label>Password {editing ? "" : "*"}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
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
