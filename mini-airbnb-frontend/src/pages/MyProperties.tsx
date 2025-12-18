import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { propertyService } from "../services/propertyService";
import { UserRole } from "../types";
import type { Property } from "../types";
import ConfirmationModal from "../components/ConfirmationModal";

const MyProperties = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // State pentru modal
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "info" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (
      user?.role !== UserRole.ROLE_HOST &&
      user?.role !== UserRole.ROLE_ADMIN
    ) {
      navigate("/");
      return;
    }

    loadProperties().then(() => setIsVisible(true));
  }, [isAuthenticated, user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getMyProperties();
      setProperties(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Eroare la încărcarea proprietăților.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setModalConfig({
      isOpen: true,
      title: "Șterge proprietatea",
      message: "Ești sigur că vrei să ștergi această proprietate? Toate datele asociate vor fi pierdute definitiv.",
      type: "danger",
      onConfirm: async () => {
        try {
          setDeletingId(id);
          await propertyService.deleteProperty(id);
          setProperties(properties.filter((p) => p.id !== id));
          showToast("Proprietatea a fost ștearsă.", "info");
        } catch (err: any) {
          const errorMessage = err.response?.data || "Eroare la ștergerea proprietății.";
          showToast(errorMessage, "error");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== UserRole.ROLE_HOST && user?.role !== UserRole.ROLE_ADMIN) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 80px",
          borderBottom: "1px solid #ebebeb",
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "#FF385C",
            fontSize: "18px",
            fontWeight: "600",
            letterSpacing: "-0.2px",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <svg
            width="30"
            height="30"
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
        <Link
          to="/"
          style={{
            color: "#222",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px 16px",
            borderRadius: "22px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f7f7f7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          ← Înapoi
        </Link>
      </header>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "56px 40px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: "600",
                color: "#222",
                marginBottom: "12px",
                letterSpacing: "-0.4px",
              }}
            >
              Proprietățile mele
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "#717171",
                lineHeight: "1.5",
              }}
            >
              Gestionează toate proprietățile tale
            </p>
          </div>
          <Link
            to="/create-property"
            style={{
              padding: "12px 24px",
              backgroundColor: "#222",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#222";
            }}
          >
            + Adaugă proprietate
          </Link>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fff5f5",
              border: "1px solid #feb2b2",
              color: "#c53030",
              padding: "14px 18px",
              borderRadius: "8px",
              marginBottom: "32px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#717171",
              fontSize: "15px",
            }}
          >
            Se încarcă proprietățile...
          </div>
        ) : properties.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              backgroundColor: "#fafafa",
              borderRadius: "12px",
              border: "1px solid #ebebeb",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              🏠
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#222",
                marginBottom: "8px",
              }}
            >
              Nu ai proprietăți încă
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: "#717171",
                marginBottom: "24px",
              }}
            >
              Adaugă prima ta proprietate pentru a începe să primești rezervări
            </p>
            <Link
              to="/create-property"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#222",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#222";
              }}
            >
              Adaugă prima proprietate
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "32px",
            }}
          >
            {properties.map((property, index) => (
              <div
                key={property.id}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #ebebeb",
                  backgroundColor: "#fff",
                  transition:
                    "transform 0.2s, box-shadow 0.2s, opacity 0.5s ease-out, transform 0.5s ease-out",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${index * 0.05}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: "100%",
                    height: "240px",
                    backgroundColor: "#f7f7f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#717171",
                    fontSize: "14px",
                    backgroundImage:
                      property.imageUrls && property.imageUrls.length > 0
                        ? `url("${property.imageUrls[0]}")`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {(!property.imageUrls || property.imageUrls.length === 0) &&
                    "Imagine"}
                </div>

                {/* Content */}
                <div style={{ padding: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#222",
                        margin: 0,
                        flex: 1,
                        lineHeight: "1.4",
                      }}
                    >
                      {property.title}
                    </h3>
                    {!property.isActive && (
                      <span
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "#fff5f5",
                          color: "#c53030",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          marginLeft: "8px",
                        }}
                      >
                        Inactivă
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "15px",
                      color: "#717171",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {property.city}, {property.country}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "13px",
                      color: "#717171",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 4v16M2 8h18M2 12h18M2 16h18M22 4v16" />
                      </svg>
                      {property.bedrooms}{" "}
                      {property.bedrooms === 1 ? "pat" : "paturi"}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16v16H4zM4 8h16M4 12h16M4 16h16" />
                      </svg>
                      {property.bathrooms}{" "}
                      {property.bathrooms === 1 ? "baie" : "băi"}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Max {property.maxGuests}{" "}
                      {property.maxGuests === 1 ? "oaspete" : "oaspeți"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      marginBottom: "20px",
                      paddingBottom: "20px",
                      borderBottom: "1px solid #ebebeb",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      {property.pricePerNight}€
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#717171",
                        marginLeft: "4px",
                        fontWeight: "400",
                      }}
                    >
                      / noapte
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <Link
                      to={`/property/${property.id}`}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        backgroundColor: "transparent",
                        color: "#222",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        textDecoration: "none",
                        textAlign: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f7f7f7";
                        e.currentTarget.style.borderColor = "#bbb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "#ddd";
                      }}
                    >
                      Vezi
                    </Link>
                    <Link
                      to={`/edit-property/${property.id}`}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        backgroundColor: "#222",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        textDecoration: "none",
                        textAlign: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#222";
                      }}
                    >
                      Editează
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      disabled={deletingId === property.id}
                      style={{
                        padding: "10px 16px",
                        backgroundColor:
                          deletingId === property.id ? "#ddd" : "#fff5f5",
                        color: deletingId === property.id ? "#999" : "#c53030",
                        border: "1px solid #feb2b2",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor:
                          deletingId === property.id
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (deletingId !== property.id) {
                          e.currentTarget.style.backgroundColor = "#fee";
                          e.currentTarget.style.borderColor = "#c53030";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deletingId !== property.id) {
                          e.currentTarget.style.backgroundColor = "#fff5f5";
                          e.currentTarget.style.borderColor = "#feb2b2";
                        }
                      }}
                    >
                      {deletingId === property.id ? "..." : "Șterge"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};

export default MyProperties;
