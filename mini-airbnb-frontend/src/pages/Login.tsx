import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { LoginRequest } from "../types";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials: LoginRequest = { email, password };
      await login(credentials);
      showToast("Te-ai conectat cu succes!", "success");
      
      // Verificăm dacă avem o cale de redirecționare salvată
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get("redirectTo") || "/";
      navigate(redirectTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Eroare la conectare.";
      showToast(message === "Invalid email or password" ? "Email sau parolă incorectă." : message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ height: "100vh", backgroundColor: "#fff", overflow: "hidden" }}
    >
      {/* Main Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          height: "100vh",
          padding: "40px 20px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            backgroundColor: "#fff",
            padding: "36px",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #ebebeb",
          }}
        >
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "600",
              color: "#222",
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            Bun venit
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#717171",
              marginBottom: "24px",
            }}
          >
            Conectează-te pentru a continua
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  boxSizing: "border-box",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "15px",
                  color: "#222",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#222";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(0,0,0,0.05)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#ddd";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                Parolă
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  boxSizing: "border-box",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "15px",
                  color: "#222",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#222";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(0,0,0,0.05)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#ddd";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#222",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#000";
                  e.currentTarget.style.transform = "scale(1.01)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#222";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading ? "Se conectează..." : "Conectează-te"}
            </button>
          </form>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #ebebeb",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#717171",
                margin: 0,
              }}
            >
              Nu ai cont?{" "}
              <Link
                to="/register"
                style={{
                  color: "#222",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF385C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#222";
                }}
              >
                Înregistrează-te
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
