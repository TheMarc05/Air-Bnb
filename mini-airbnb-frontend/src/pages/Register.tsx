import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { RegisterRequest } from "../types";
import { UserRole } from "../types";

const Register = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: UserRole.ROLE_GUEST,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
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
            Creează cont
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#717171",
              marginBottom: "24px",
            }}
          >
            Înregistrează-te pentru a începe
          </p>

          {error && (
            <div
              style={{
                backgroundColor: "#fff5f5",
                border: "1px solid #feb2b2",
                color: "#c53030",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

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
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
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

            <div style={{ marginBottom: "16px" }}>
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
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

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="firstName"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#222",
                  }}
                >
                  Prenume
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
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

              <div style={{ flex: 1 }}>
                <label
                  htmlFor="lastName"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#222",
                  }}
                >
                  Nume
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
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
              {loading ? "Se înregistrează..." : "Înregistrează-te"}
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
              Ai deja cont?{" "}
              <Link
                to="/login"
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
                Conectează-te
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
