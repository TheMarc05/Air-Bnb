import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { propertyService } from "../services/propertyService";
import { UserRole } from "../types";
import type { Property } from "../types";
import ConfirmationModal from "../components/ConfirmationModal";

const Home = () => {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [becomingHost, setBecomingHost] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    minBathrooms: "",
    maxGuests: "",
  });

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
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBecomeHost = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (
      user?.role === UserRole.ROLE_HOST ||
      user?.role === UserRole.ROLE_ADMIN
    ) {
      showToast("Ești deja gazdă!", "info");
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Devino gazdă",
      message:
        "Vrei să devii gazdă pe Airbnb? Vei putea să îți publici propriile proprietăți și să primești rezervări.",
      type: "success",
      onConfirm: async () => {
        setBecomingHost(true);
        try {
          const response = await authService.becomeHost();
          authService.saveAuthData(response);
          updateUser({
            id: response.id,
            email: response.email,
            role: response.role as UserRole,
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
          });
          setShowHostModal(true);
          showToast("Acum ești gazdă!", "success");
        } catch (error) {
          showToast(
            "Eroare la schimbarea rolului. Te rugăm să încerci din nou.",
            "error"
          );
          console.error(error);
        } finally {
          setBecomingHost(false);
        }
      },
    });
  };

  const handleLogout = () => {
    setModalConfig({
      isOpen: true,
      title: "Deconectare",
      message: "Ești sigur că vrei să te deconectezi?",
      type: "info",
      onConfirm: () => {
        logout();
        setShowUserMenu(false);
        showToast("Te-ai deconectat cu succes.", "info");
        navigate("/");
      },
    });
  };

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getAllProperties(
          filters.city || undefined,
          filters.country || undefined
        );
        setProperties(data);
      } catch (error) {
        console.error("Failed to load properties:", error);
        showToast("Eroare la încărcarea proprietăților.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
    setIsVisible(true);
  }, [filters.city, filters.country]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      country: "",
      minPrice: "",
      maxPrice: "",
      minBedrooms: "",
      minBathrooms: "",
      maxGuests: "",
    });
  };

  const filteredProperties = properties.filter((property) => {
    if (filters.minPrice && property.pricePerNight < Number(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && property.pricePerNight > Number(filters.maxPrice)) {
      return false;
    }
    if (
      filters.minBedrooms &&
      property.bedrooms < Number(filters.minBedrooms)
    ) {
      return false;
    }
    if (
      filters.minBathrooms &&
      property.bathrooms < Number(filters.minBathrooms)
    ) {
      return false;
    }
    if (filters.maxGuests && property.maxGuests < Number(filters.maxGuests)) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Host Success Modal */}
      {showHostModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowHostModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#222",
                  margin: 0,
                }}
              >
                Felicitări!
              </h2>
            </div>
            <p
              style={{
                fontSize: "16px",
                color: "#717171",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              Ești acum Gazdă! Poți crea și gestiona proprietăți.
            </p>
            <button
              onClick={() => setShowHostModal(false)}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#222",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#222";
              }}
            >
              Perfect!
            </button>
          </div>
        </div>
      )}
      {/* Header - Professional and Elegant */}
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
        {/* Logo */}
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

        {/* Navigation - Only Locuințe */}
        <nav
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <a
            href="#"
            style={{
              textDecoration: "none",
              color: "#222",
              fontWeight: "600",
              fontSize: "14px",
              padding: "8px 0",
              borderBottom: "2px solid #222",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FF385C";
              e.currentTarget.style.borderBottomColor = "#FF385C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#222";
              e.currentTarget.style.borderBottomColor = "#222";
            }}
          >
            <span style={{ fontSize: "18px" }}>🏠</span>
            Locuințe
          </a>
        </nav>

        {/* Right Side - User Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAuthenticated ? (
            <>
              {/* Buton "Adaugă proprietate" pentru HOST */}
              {(user?.role === UserRole.ROLE_HOST ||
                user?.role === UserRole.ROLE_ADMIN) && (
                <Link
                  to="/create-property"
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "22px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#222",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f7f7f7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Adaugă proprietate
                </Link>
              )}

              {/* Buton "Devino gazdă" */}
              {user?.role !== UserRole.ROLE_HOST &&
                user?.role !== UserRole.ROLE_ADMIN && (
                  <button
                    onClick={handleBecomeHost}
                    disabled={becomingHost}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "22px",
                      cursor: becomingHost ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#222",
                      transition: "all 0.2s",
                      opacity: becomingHost ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!becomingHost) {
                        e.currentTarget.style.backgroundColor = "#f7f7f7";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {becomingHost ? "Se procesează..." : "Devino gazdă"}
                  </button>
                )}

              {/* User Menu */}
              <div
                ref={menuRef}
                style={{
                  position: "relative",
                }}
              >
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "6px 6px 6px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "22px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    backgroundColor: showUserMenu ? "#f7f7f7" : "transparent",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style={{ color: "#717171" }}
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                  </svg>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#717171",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "16px",
                    }}
                  >
                    👤
                  </div>
                </div>
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "8px",
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      border: "1px solid #ebebeb",
                      minWidth: "200px",
                      padding: "8px",
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #ebebeb",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        Salut {user?.firstName}!
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#717171",
                          marginTop: "2px",
                        }}
                      >
                        {user?.email}
                      </div>
                    </div>
                    <Link
                      to="/my-reservations"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "#222",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "500",
                        borderRadius: "8px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f7f7f7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Rezervările mele
                    </Link>
                    {(user?.role === UserRole.ROLE_HOST ||
                      user?.role === UserRole.ROLE_ADMIN) && (
                      <Link
                        to="/my-properties"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: "block",
                          padding: "12px 16px",
                          color: "#222",
                          textDecoration: "none",
                          fontSize: "14px",
                          fontWeight: "500",
                          borderRadius: "8px",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f7f7f7";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Proprietățile mele
                      </Link>
                    )}
                    <div
                      style={{
                        height: "1px",
                        backgroundColor: "#ebebeb",
                        margin: "8px 0",
                      }}
                    />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        backgroundColor: "transparent",
                        color: "#222",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f7f7f7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Deconectează-te
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "22px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#222",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7f7f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Intră în cont
              </button>
              <div
                ref={menuRef}
                style={{
                  position: "relative",
                }}
              >
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "6px 6px 6px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "22px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    backgroundColor: showUserMenu ? "#f7f7f7" : "transparent",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style={{ color: "#717171" }}
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                  </svg>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#717171",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "16px",
                    }}
                  >
                    👤
                  </div>
                </div>
                {showUserMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "8px",
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      border: "1px solid #ebebeb",
                      minWidth: "200px",
                      padding: "8px",
                      zIndex: 200,
                    }}
                  >
                    <Link
                      to="/login"
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "#222",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "600",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f7f7f7")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      Autentificare
                    </Link>
                    <Link
                      to="/register"
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "#717171",
                        textDecoration: "none",
                        fontSize: "14px",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f7f7f7")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      Înregistrare
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero Section - Professional and Elegant */}
      <section
        style={{
          backgroundColor: "#fff",
          padding: "48px 80px 56px",
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
          <h1
            style={{
              fontSize: "28px",
              color: "#222",
              marginBottom: "40px",
              fontWeight: "600",
              letterSpacing: "-0.3px",
            }}
          >
            Descoperă locuri unice de cazare în toată lumea
          </h1>

          {/* Filters Section */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              maxWidth: "1000px",
              margin: "0 auto",
              border: "1px solid #ebebeb",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "6px",
                  }}
                >
                  Oraș
                </label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  placeholder="Ex: București"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "6px",
                  }}
                >
                  Țară
                </label>
                <input
                  type="text"
                  value={filters.country}
                  onChange={(e) =>
                    handleFilterChange("country", e.target.value)
                  }
                  placeholder="Ex: România"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "6px",
                  }}
                >
                  Preț min (€)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  placeholder="Min"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "6px",
                  }}
                >
                  Preț max (€)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  placeholder="Max"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "6px",
                  }}
                >
                  Dormitoare min
                </label>
                <input
                  type="number"
                  min="1"
                  value={filters.minBedrooms}
                  onChange={(e) =>
                    handleFilterChange("minBedrooms", e.target.value)
                  }
                  placeholder="Min"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "6px",
                  }}
                >
                  Băi min
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={filters.minBathrooms}
                  onChange={(e) =>
                    handleFilterChange("minBathrooms", e.target.value)
                  }
                  placeholder="Min"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                />
              </div>
            </div>
            {(filters.city ||
              filters.country ||
              filters.minPrice ||
              filters.maxPrice ||
              filters.minBedrooms ||
              filters.minBathrooms ||
              filters.maxGuests) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#222",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
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
                Șterge filtrele
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main
        style={{
          padding: "48px 80px 80px",
          maxWidth: "1760px",
          margin: "0 auto",
        }}
      >
        {/* Properties Section */}
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "40px",
              color: "#222",
              letterSpacing: "-0.2px",
            }}
          >
            Explorează locuințe
          </h2>
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
          ) : filteredProperties.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#717171",
                fontSize: "15px",
              }}
            >
              Nu există proprietăți disponibile momentan.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "32px",
              }}
            >
              {filteredProperties.map((property, index) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transition: `all 0.5s ease-out ${index * 0.05}s`,
                  }}
                >
                  <div
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid #ebebeb",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
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
                        height: "280px",
                        backgroundColor: "#f7f7f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#717171",
                        fontSize: "14px",
                        position: "relative",
                        backgroundImage:
                          property.imageUrls && property.imageUrls.length > 0
                            ? `url("${property.imageUrls[0]}")`
                            : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {(!property.imageUrls ||
                        property.imageUrls.length === 0) &&
                        "Imagine"}
                    </div>

                    {/* Content */}
                    <div style={{ padding: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#222",
                            margin: 0,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            lineHeight: "1.4",
                          }}
                        >
                          {property.title}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginLeft: "8px",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>⭐</span>
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#222",
                            }}
                          >
                            4.8
                          </span>
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: "15px",
                          color: "#717171",
                          margin: "0 0 12px 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
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
                          {property.maxGuests}{" "}
                          {property.maxGuests === 1 ? "oaspete" : "oaspeți"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px solid #ebebeb",
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

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

export default Home;
