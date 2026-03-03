import api from "../api/axios";
import { FaFilePdf } from "react-icons/fa";

export default function Reports() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const openPdf = async (endpoint) => {
    try {
      const res = await api.get(endpoint, { responseType: "blob" });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => window.URL.revokeObjectURL(url), 8000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No se pudo generar el reporte");
    }
  };

  const cardStyle = {
    background: "white",
    borderRadius: 12,
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const buttonStyle = {
    padding: "10px 18px",
    borderRadius: 10,
    cursor: "pointer",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "0.2s ease",
  };

  return (
    <div>
      <h2 style={{ margin: 0 }}>Reportes</h2>

      <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
        <div style={cardStyle}>
          <div>
            <h3 style={{ margin: 0 }}>Reporte de Escuelas</h3>
            <p style={{ marginTop: 8, color: "#6b7280" }}>
              {user?.tipo === "Administrador"
                ? "Incluye todas las escuelas registradas."
                : "Incluye únicamente la escuela vinculada a tu usuario."}
            </p>
          </div>

          <button
            onClick={() => openPdf("/reports/schools")}
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#b91c1c")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc2626")
            }
          >
            <FaFilePdf />
            PDF
          </button>
        </div>

        <div style={cardStyle}>
          <div>
            <h3 style={{ margin: 0 }}>Reporte de Alumnos + Responsables</h3>
            <p style={{ marginTop: 8, color: "#6b7280" }}>
              {user?.tipo === "Administrador"
                ? "Incluye alumnos de todas las escuelas con sus responsables."
                : "Incluye alumnos de tu escuela con sus responsables."}
            </p>
          </div>

          <button
            onClick={() => openPdf("/reports/alumnos")}
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#b91c1c")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc2626")
            }
          >
            <FaFilePdf />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
