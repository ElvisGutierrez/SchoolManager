import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import api from "../api/axios";
import { HiMenu } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";

export default function AppLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // asd
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="appShell">
      <Sidebar
        user={user}
        onLogout={logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="appMain">
        <div className="appHeader">
          <div className="headerLeft">
            <button
              className="btnIcon show-sm"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <HiMenu size={22} />
            </button>

            <div className="brand">SchoolManager</div>
          </div>

          <div className="headerRight">
            <div className="profileText hide-sm">
              {/* <div className="profileLabel">Perfil</div> */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FaUserCircle size={24} />
                <div className="profileName">{user?.nombre || "Usuario"}</div>
              </div>
            </div>

            <button className="btn" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="appContent">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
