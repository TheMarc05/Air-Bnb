import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { UserRole } from "../types";

const Home = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [becomingHost, setBecomingHost] = useState(false);

  const handleBecomeHost = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (
      user?.role === UserRole.ROLE_HOST ||
      user?.role === UserRole.ROLE_ADMIN
    ) {
      alert("You are already a host!");
      return;
    }

    setBecomingHost(true);
    try {
      const response = await authService.becomeHost();
      authService.saveAuthData(response);
      updateUser({
        email: response.email,
        role: response.role as UserRole,
      });
      alert("🎉 Congratulations! You are now a Host!");
    } catch (error) {
      alert("Failed to become a host. Please try again.");
      console.error(error);
    } finally {
      setBecomingHost(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Header - Clean and Minimal */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 80px",
          borderBottom: "1px solid #ebebeb",
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "#FF385C",
            fontSize: "20px",
            fontWeight: "600",
            letterSpacing: "-0.3px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            style={{ marginRight: "8px" }}
          >
            <path
              d="M16 0C7.163 0 0 7.163 0 16c0 8.837 7.163 16 16 16s16-7.163 16-16C32 7.163 24.837 0 16 0z"
              fill="#FF385C"
            />
            <path
              d="M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z"
              fill="#fff"
            />
          </svg>
          <span>airbnb</span>
        </Link>

        {/* Navigation - Only Locuințe */}
        <nav>
          <a
            href="#"
            style={{
              textDecoration: "none",
              color: "#222",
              fontWeight: "600",
              fontSize: "15px",
              paddingBottom: "24px",
              borderBottom: "2px solid #222",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FF385C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#222";
            }}
          >
            Locuințe
          </a>
        </nav>

        {/* Right Side - User Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isAuthenticated ? (
            <>
              {/* Buton "Devino gazdă" */}
              {user?.role !== UserRole.ROLE_HOST &&
                user?.role !== UserRole.ROLE_ADMIN && (
                  <button
                    onClick={handleBecomeHost}
                    disabled={becomingHost}
                    style={{
                      padding: "14px 24px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "24px",
                      cursor: becomingHost ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "15px",
                      color: "#222",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!becomingHost) {
                        e.currentTarget.style.backgroundColor = "#f7f7f7";
                        e.currentTarget.style.transform = "scale(1.02)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {becomingHost ? "Se procesează..." : "Devino gazdă"}
                  </button>
                )}

              {/* User Menu */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "7px 7px 7px 14px",
                  border: "1px solid #ddd",
                  borderRadius: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.18)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style={{ color: "#717171" }}
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#717171",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "18px",
                  }}
                >
                  👤
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "14px 24px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "24px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "15px",
                  color: "#222",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7f7f7";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Devino gazdă
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "7px 7px 7px 14px",
                  border: "1px solid #ddd",
                  borderRadius: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.18)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={() => navigate("/login")}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style={{ color: "#717171" }}
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#717171",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "18px",
                  }}
                >
                  👤
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero Section - Simple and Elegant */}
      <section
        style={{
          backgroundColor: "#fafafa",
          padding: "60px 80px 60px",
          borderBottom: "1px solid #ebebeb",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "#717171",
              marginBottom: "32px",
              fontWeight: "400",
            }}
          >
            Descoperă locuri unice de cazare în toată lumea
          </p>

          {/* Search Bar - Clean Design */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: "40px",
              padding: "4px 4px 4px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              maxWidth: "850px",
              margin: "0 auto",
              border: "1px solid #ebebeb",
              transition: "box-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "18px 24px",
                borderRight: "1px solid #ebebeb",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fafafa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#222",
                }}
              >
                Unde?
              </div>
              <div style={{ fontSize: "14px", color: "#717171" }}>
                Caută destinații
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "18px 24px",
                borderRight: "1px solid #ebebeb",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fafafa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#222",
                }}
              >
                Când
              </div>
              <div style={{ fontSize: "14px", color: "#717171" }}>
                Adaugă datele
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "18px 24px",
                borderRight: "1px solid #ebebeb",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fafafa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#222",
                }}
              >
                Cine?
              </div>
              <div style={{ fontSize: "14px", color: "#717171" }}>
                Adaugă oaspeți
              </div>
            </div>
            <button
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#FF385C",
                border: "none",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "8px",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(255,56,92,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.backgroundColor = "#e61e4d";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(255,56,92,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#FF385C";
                e.currentTarget.style.boxShadow =
                  "0 2px 4px rgba(255,56,92,0.2)";
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="7" cy="7" r="6" />
                <path d="M12 12l-3-3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main
        style={{
          padding: "40px 80px",
          maxWidth: "1760px",
          margin: "0 auto",
        }}
      >
        {isAuthenticated && user?.role === UserRole.ROLE_HOST && (
          <div
            style={{
              backgroundColor: "#f7f7f7",
              padding: "20px 24px",
              borderRadius: "12px",
              marginBottom: "32px",
              border: "1px solid #ebebeb",
            }}
          >
            <p
              style={{
                color: "#222",
                fontWeight: "500",
                fontSize: "15px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>✓</span>
              Felicitări! Ești acum Gazdă! Poți crea și gestiona proprietăți.
            </p>
          </div>
        )}

        {/* Properties Section */}
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "600",
              marginBottom: "32px",
              color: "#222",
            }}
          >
            Exploră locuințe
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "40px",
            }}
          >
            {/* Placeholder pentru proprietăți */}
            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #ebebeb",
                backgroundColor: "#fafafa",
                minHeight: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#717171",
                fontSize: "14px",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <p>Proprietăți vor apărea aici</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
