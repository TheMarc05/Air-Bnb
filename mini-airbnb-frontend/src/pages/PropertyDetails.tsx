import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { propertyService } from "../services/propertyService";
import { reservationService } from "../services/reservationService";
import type { Property } from "../types";
import type { ReservationRequest } from "../types";
import ConfirmationModal from "../components/ConfirmationModal";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservationData, setReservationData] = useState<ReservationRequest>({
    propertyId: Number(id),
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
  });
  const [reserving, setReserving] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [error, setError] = useState(false); // Changed to boolean for UI state

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
    const loadProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await propertyService.getPropertyById(Number(id));
        setProperty(data);
        setReservationData((prev) => ({
          ...prev,
          propertyId: data.id,
        }));
      } catch (err) {
        setError(true);
        showToast("Proprietatea nu a fost găsită.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Salvăm locația curentă pentru a ne întoarce după login
      navigate(`/login?redirectTo=/property/${id}`);
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Confirmă rezervarea",
      message: `Ești sigur că vrei să rezervi această proprietate pentru perioada ${reservationData.checkInDate} - ${reservationData.checkOutDate}?`,
      type: "success",
      onConfirm: async () => {
        setReserving(true);
        try {
          await reservationService.createReservation(reservationData);
          showToast("Rezervare creată cu succes! Așteaptă confirmarea de la gazdă.", "success");
          navigate("/my-reservations");
        } catch (err: any) {
          showToast(
            err.response?.data?.message ||
              err.message ||
              "Eroare la crearea rezervării. Te rugăm să încerci din nou.",
            "error"
          );
        } finally {
          setReserving(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#717171",
        }}
      >
        Se încarcă...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <p style={{ color: "#c53030", marginBottom: "20px" }}>
          Proprietatea nu a fost găsită
        </p>
        <Link
          to="/"
          style={{
            color: "#222",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          ← Înapoi la Home
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === property.host.id;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Full Photo Modal */}
      {showAllPhotos && property.imageUrls && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            zIndex: 2000,
            overflowY: "auto",
            padding: "40px",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <button
              onClick={() => setShowAllPhotos(false)}
              style={{
                position: "fixed",
                top: "20px",
                left: "20px",
                padding: "10px 20px",
                backgroundColor: "#f7f7f7",
                border: "1px solid #ddd",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ← Înapoi
            </button>
            <h2 style={{ marginBottom: "32px", fontSize: "24px" }}>
              Toate pozele ({property.imageUrls.length})
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {property.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Proprietate ${index + 1}`}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    display: "block",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
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
        style={{ maxWidth: "1760px", margin: "0 auto", padding: "40px 80px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "80px",
          }}
        >
          {/* Left Column - Property Details */}
          <div>
            {/* Title */}
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "600",
                color: "#222",
                marginBottom: "12px",
              }}
            >
              {property.title}
            </h1>

            {/* Location & Rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
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
              <span style={{ color: "#717171" }}>•</span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#222",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
              >
                {property.city}, {property.country}
              </span>
            </div>

            {/* Image Section */}
            <div
              style={{
                width: "100%",
                height: "500px",
                backgroundColor: "#f7f7f7",
                borderRadius: "12px",
                marginBottom: "32px",
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
                position: "relative",
                overflow: "hidden",
              }}
            >
              {(!property.imageUrls || property.imageUrls.length === 0) &&
                "Imagine proprietate"}

              {property.imageUrls && property.imageUrls.length > 1 && (
                <div
                  onClick={() => setShowAllPhotos(true)}
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#222",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                  }}
                >
                  Vezi toate cele {property.imageUrls.length} poze
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#222",
                  marginBottom: "16px",
                }}
              >
                Despre această locuință
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "#222",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div
              style={{
                paddingTop: "32px",
                borderTop: "1px solid #ebebeb",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#222",
                  marginBottom: "24px",
                }}
              >
                Ce oferă această locuință
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "32px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div style={{ color: "#222" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 4v16M2 8h18M2 12h18M2 16h18M22 4v16" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      {property.bedrooms}{" "}
                      {property.bedrooms === 1 ? "dormitor" : "dormitoare"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#717171" }}>
                      Dormitoare
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div style={{ color: "#222" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16v16H4zM4 8h16M4 12h16M4 16h16" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      {property.bathrooms}{" "}
                      {property.bathrooms === 1 ? "baie" : "băi"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#717171" }}>
                      Băi
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div style={{ color: "#222" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      Max {property.maxGuests}{" "}
                      {property.maxGuests === 1 ? "oaspete" : "oaspeți"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#717171" }}>
                      Capacitate
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div style={{ color: "#222" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      {property.address}
                    </div>
                    <div style={{ fontSize: "14px", color: "#717171" }}>
                      Adresă
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reservation Card */}
          <div
            style={{ position: "sticky", top: "100px", height: "fit-content" }}
          >
            <div
              style={{
                border: "1px solid #ebebeb",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {isOwner ? (
                <div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "8px",
                    }}
                  >
                    {property.pricePerNight}€
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "400",
                        color: "#717171",
                      }}
                    >
                      {" "}
                      / noapte
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#717171",
                      marginTop: "16px",
                      fontWeight: "600",
                      textAlign: "center",
                      padding: "12px",
                      backgroundColor: "#f7f7f7",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    Nu poți închiria deoarece ești host-ul!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReservation}>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "24px",
                    }}
                  >
                    {property.pricePerNight}€
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "400",
                        color: "#717171",
                      }}
                    >
                      {" "}
                      / noapte
                    </span>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#222",
                        marginBottom: "8px",
                      }}
                    >
                      Check-in
                    </label>
                    <input
                      type="date"
                      required
                      value={reservationData.checkInDate}
                      onChange={(e) =>
                        setReservationData({
                          ...reservationData,
                          checkInDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "15px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#222",
                        marginBottom: "8px",
                      }}
                    >
                      Check-out
                    </label>
                    <input
                      type="date"
                      required
                      value={reservationData.checkOutDate}
                      onChange={(e) =>
                        setReservationData({
                          ...reservationData,
                          checkOutDate: e.target.value,
                        })
                      }
                      min={
                        reservationData.checkInDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "15px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#222",
                        marginBottom: "8px",
                      }}
                    >
                      Număr oaspeți
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={property.maxGuests}
                      value={reservationData.numberOfGuests}
                      onChange={(e) =>
                        setReservationData({
                          ...reservationData,
                          numberOfGuests: Number(e.target.value),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "15px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reserving}
                    style={{
                      width: "100%",
                      padding: "16px",
                      backgroundColor: "#222",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: !reserving ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!reserving) {
                        e.currentTarget.style.backgroundColor = "#000";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!reserving) {
                        e.currentTarget.style.backgroundColor = "#222";
                      }
                    }}
                  >
                    {reserving
                      ? "Se procesează..."
                      : !isAuthenticated
                      ? "Conectează-te pentru a rezerva"
                      : "Rezervă"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
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

export default PropertyDetails;
