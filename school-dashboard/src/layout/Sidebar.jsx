import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "#111827" : "#374151",
  background: isActive ? "#e5e7eb" : "transparent",
  fontWeight: isActive ? 700 : 600,
});

export default function Sidebar({ user, /* onLogout, */ open, onClose }) {
  const isAdmin = user?.tipo === "Administrador";

  return (
    <>
      <div
        onClick={onClose}
        className={`sidebarOverlay show-sm ${open ? "open" : ""}`}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebarTop">
          <button className="btnIcon show-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="sidebarTop2">
          <img
            src={logo}
            alt="Logo"
            style={{ width: 170, height: 120, borderRadius: "50%" }}
          />
        </div>

        <nav className="sidebarNav">
          <NavLink to="/dashboard" style={linkStyle} onClick={onClose}>
            Dashboard
          </NavLink>
          <NavLink to="/schools" style={linkStyle} onClick={onClose}>
            Escuelas
          </NavLink>
          <NavLink to="/padres" style={linkStyle} onClick={onClose}>
            Padres
          </NavLink>
          <NavLink to="/alumnos" style={linkStyle} onClick={onClose}>
            Alumnos
          </NavLink>
          <NavLink to="/reportes" style={linkStyle} onClick={onClose}>
            Reportes
          </NavLink>
          <NavLink to="/users" style={linkStyle} onClick={onClose}>
            Usuarios
          </NavLink>

          {isAdmin && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              Admin: acceso total
            </div>
          )}
          {!isAdmin && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              User: acceso limitado
            </div>
          )}
        </nav>

        {/* <div className="sidebarBottom">
          <button className="btnOutline" onClick={onLogout}>
            Cerrar sessión
          </button>
        </div> */}
      </aside>

      <div className="sidebarSpacer" />
    </>
  );
}
