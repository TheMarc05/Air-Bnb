import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { propertyService } from "../services/propertyService";
import { reservationService } from "../services/reservationService";
import type { Property } from "../types";
import type { ReservationRequest } from "../types";
import { UserRole } from "../types";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservationData, setReservationData] = useState<ReservationRequest>({
    propertyId: Number(id),
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
  });
  const [reserving, setReserving] = useState(false);

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
        setError("Proprietatea nu a fost găsită.");
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
      navigate("/login");
      return;
    }

    setReserving(true);
    try {
      await reservationService.createReservation(reservationData);
      alert("Rezervare creată cu succes! Așteaptă confirmarea de la gazdă.");
      navigate("/");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Eroare la crearea rezervării. Te rugăm să încerci din nou."
      );
    } finally {
      setReserving(false);
    }
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
          {error || "Proprietatea nu a fost găsită"}
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

  const isHost = user?.role === UserRole.ROLE_HOST || user?.role === UserRole.ROLE_ADMIN;
  const isOwner = user?.id === property.host.id;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Header */}
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
        <Link
          to="/"
          style={{
            color: "#222",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          ← Înapoi
        </Link>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: "1760px", margin: "0 auto", padding: "40px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "80px" }}>
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
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#717171" }}>
                {property.city}, {property.country}
              </span>
              <span style={{ fontSize: "14px", color: "#717171" }}>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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

            {/* Image Placeholder */}
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
              }}
            >
              Imagine proprietate
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
                  gap: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>🛏️</span>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#222" }}>
                      {property.bedrooms} {property.bedrooms === 1 ? "pat" : "paturi"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#717171" }}>Dormitoare</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>🚿</span>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#222" }}>
                      {property.bathrooms} {property.bathrooms === 1 ? "baie" : "băi"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#717171" }}>Băi</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>👥</span>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#222" }}>
                      Max {property.maxGuests} {property.maxGuests === 1 ? "oaspete" : "oaspeți"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#717171" }}>Capacitate</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>📍</span>
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
                    <div style={{ fontSize: "14px", color: "#717171" }}>Adresă</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reservation Card */}
          <div style={{ position: "sticky", top: "100px", height: "fit-content" }}>
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
                  <p style={{ fontSize: "14px", color: "#717171", marginTop: "16px" }}>
                    Aceasta este proprietatea ta. Nu poți face rezervări pentru propria
                    proprietate.
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
                    disabled={reserving || !isAuthenticated}
                    style={{
                      width: "100%",
                      padding: "16px",
                      backgroundColor: isAuthenticated ? "#222" : "#ddd",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: isAuthenticated && !reserving ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (isAuthenticated && !reserving) {
                        e.currentTarget.style.backgroundColor = "#000";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAuthenticated && !reserving) {
                        e.currentTarget.style.backgroundColor = "#222";
                      }
                    }}
                  >
                    {!isAuthenticated
                      ? "Conectează-te pentru a rezerva"
                      : reserving
                      ? "Se procesează..."
                      : "Rezervă"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

