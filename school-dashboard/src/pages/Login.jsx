import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", {
        email,
        password,
        device_name: "react-app",
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        "Error al iniciar sesión";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          width: 400,
          height: 400,
          border: "1px solid #ddd",
          padding: 16,
          borderRadius: 10,
          backgroundColor: "white",
        }}
      >
        <h2 style={{ marginTop: 0, textAlign: "center", fontSize: 40 }}>
          Login
        </h2>

        {/* <label>Email</label> */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          style={{
            width: "90%",
            height: "50px",
            padding: 10,
            margin: "6px 0 12px 0",
            backgroundColor: "#e5eaff",
            border: "none",
            color: "black",
            outline: "none",
          }}
          placeholder="Correo electronico"
          required
        />

        {/* <label>Password</label> */}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          style={{
            width: "90%",
            height: "50px",
            padding: 10,
            margin: "6px 0 12px 0",
            backgroundColor: "#e5eaff",
            border: "none",
            color: "black",
            outline: "none",
          }}
          placeholder="Contraseña"
          required
        />

        {error && (
          <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>
        )}

        <button
          disabled={loading}
          style={{
            width: "90%",
            padding: 10,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            height: "50px",
          }}
          type="submit"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
