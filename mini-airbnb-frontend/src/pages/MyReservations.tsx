import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { reservationService } from "../services/reservationService";
import { UserRole, ReservationStatus } from "../types";
import type { Reservation } from "../types";
import ConfirmationModal from "../components/ConfirmationModal";

const MyReservations = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"trips" | "received">("trips");

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

  const isHost = user?.role === UserRole.ROLE_HOST || user?.role === UserRole.ROLE_ADMIN;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadReservations().then(() => setIsVisible(true));
  }, [isAuthenticated, user?.role, activeTab]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      let data: Reservation[];
      if (activeTab === "received" && isHost) {
        data = await reservationService.getHostReservations();
      } else {
        data = await reservationService.getMyReservations();
      }
      setReservations(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Eroare la încărcarea rezervărilor.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    setModalConfig({
      isOpen: true,
      title: "Confirmă rezervarea",
      message: "Ești sigur că vrei să confirmi această rezervare? Această acțiune va anunța oaspetele.",
      type: "success",
      onConfirm: async () => {
        try {
          setProcessingId(id);
          await reservationService.confirmReservation(id);
          showToast("Rezervare confirmată!", "success");
          await loadReservations();
        } catch (err: any) {
          showToast(err.response?.data?.message || err.message || "Eroare la confirmarea rezervării.", "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleComplete = async (id: number) => {
    setModalConfig({
      isOpen: true,
      title: "Finalizează rezervarea",
      message: "Vrei să marchezi această rezervare ca finalizată? Asigură-te că șederea s-a încheiat.",
      type: "info",
      onConfirm: async () => {
        try {
          setProcessingId(id);
          await reservationService.completeReservation(id);
          showToast("Rezervare finalizată cu succes!", "success");
          await loadReservations();
        } catch (err: any) {
          showToast(err.response?.data?.message || err.message || "Eroare la finalizarea rezervării.", "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleCancel = async (id: number) => {
    setModalConfig({
      isOpen: true,
      title: "Anulează rezervarea",
      message: "Ești sigur că vrei să anulezi această rezervare? Această acțiune este ireversibilă.",
      type: "danger",
      onConfirm: async () => {
        try {
          setProcessingId(id);
          await reservationService.cancelReservation(id);
          showToast("Rezervare anulată.", "info");
          await loadReservations();
        } catch (err: any) {
          showToast(err.response?.data?.message || err.message || "Eroare la anularea rezervării.", "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return { bg: "#fff5e6", color: "#d97706" };
      case ReservationStatus.CONFIRMED:
        return { bg: "#f0fdf4", color: "#16a34a" };
      case ReservationStatus.CANCELLED:
        return { bg: "#fff5f5", color: "#c53030" };
      case ReservationStatus.COMPLETED:
        return { bg: "#f0f9ff", color: "#0284c7" };
      default:
        return { bg: "#f7f7f7", color: "#717171" };
    }
  };

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return "În așteptare";
      case ReservationStatus.CONFIRMED:
        return "Confirmată";
      case ReservationStatus.CANCELLED:
        return "Anulată";
      case ReservationStatus.COMPLETED:
        return "Finalizată";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
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
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "600",
            color: "#222",
            marginBottom: "12px",
            letterSpacing: "-0.4px",
          }}
        >
          Rezervările mele
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#717171",
            marginBottom: "32px",
            lineHeight: "1.5",
          }}
        >
          {isHost
            ? "Gestionează călătoriile tale sau rezervările primite ca gazdă"
            : "Vezi toate călătoriile tale viitoare sau trecute"}
        </p>

        {/* Tabs for Host */}
        {isHost && (
          <div
            style={{
              display: "flex",
              gap: "32px",
              borderBottom: "1px solid #ebebeb",
              marginBottom: "40px",
            }}
          >
            <button
              onClick={() => setActiveTab("trips")}
              style={{
                padding: "12px 0",
                fontSize: "16px",
                fontWeight: activeTab === "trips" ? "600" : "400",
                color: activeTab === "trips" ? "#222" : "#717171",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "trips" ? "2px solid #222" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Călătoriile mele 🎒
            </button>
            <button
              onClick={() => setActiveTab("received")}
              style={{
                padding: "12px 0",
                fontSize: "16px",
                fontWeight: activeTab === "received" ? "600" : "400",
                color: activeTab === "received" ? "#222" : "#717171",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "received" ? "2px solid #222" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Rezervări primite 🏠
            </button>
          </div>
        )}

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
            Se încarcă rezervările...
          </div>
        ) : reservations.length === 0 ? (
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
              📅
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#222",
                marginBottom: "8px",
              }}
            >
              Nu ai rezervări aici
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: "#717171",
              }}
            >
              {activeTab === "received"
                ? "Nu există rezervări pentru proprietățile tale încă"
                : "Nu ai făcut nicio rezervare încă"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {reservations.map((reservation, index) => {
              const statusStyle = getStatusColor(reservation.status);
              const isTrip = activeTab === "trips";
              
              return (
                <div
                  key={reservation.id}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #ebebeb",
                    backgroundColor: "#fff",
                    padding: "24px",
                    transition: "transform 0.2s, box-shadow 0.2s, opacity 0.5s ease-out, transform 0.5s ease-out",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transitionDelay: `${index * 0.05}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#222",
                            margin: 0,
                          }}
                        >
                          {reservation.property.title}
                        </h3>
                        <span
                          style={{
                            padding: "4px 12px",
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {getStatusLabel(reservation.status)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "15px",
                          color: "#717171",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {reservation.property.city}, {reservation.property.country}
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#717171",
                          margin: 0,
                        }}
                      >
                        {!isTrip
                          ? `Oaspete: ${reservation.guest.firstName} ${reservation.guest.lastName} (${reservation.guest.email})`
                          : `Gazdă: ${reservation.property.host.firstName} ${reservation.property.host.lastName}`}
                      </p>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          color: "#222",
                          marginBottom: "4px",
                        }}
                      >
                        {reservation.totalPrice}€
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#717171",
                        }}
                      >
                        Total
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                      marginBottom: "20px",
                      padding: "16px",
                      backgroundColor: "#fafafa",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#717171",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        Check-in
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          color: "#222",
                          fontWeight: "500",
                        }}
                      >
                        {formatDate(reservation.checkInDate)}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#717171",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Check-out
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          color: "#222",
                          fontWeight: "500",
                        }}
                      >
                        {formatDate(reservation.checkOutDate)}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#717171",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Oaspeți
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          color: "#222",
                          fontWeight: "500",
                        }}
                      >
                        {reservation.numberOfGuests}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Link
                      to={`/property/${reservation.property.id}`}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "transparent",
                        color: "#222",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        textDecoration: "none",
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
                      Vezi proprietatea
                    </Link>

                    {/* Host Specific Actions */}
                    {!isTrip && (
                      <>
                        {reservation.status === ReservationStatus.PENDING && (
                          <button
                            onClick={() => handleConfirm(reservation.id)}
                            disabled={processingId === reservation.id}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#222",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: processingId === reservation.id ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            Confirmă ✅
                          </button>
                        )}
                        {reservation.status === ReservationStatus.CONFIRMED && (
                          <button
                            onClick={() => handleComplete(reservation.id)}
                            disabled={processingId === reservation.id}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#0284c7",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: processingId === reservation.id ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            Finalizează ✨
                          </button>
                        )}
                      </>
                    )}

                    {/* Cancel Action (Available for both if pending/confirmed) */}
                    {(reservation.status === ReservationStatus.PENDING ||
                      reservation.status === ReservationStatus.CONFIRMED) && (
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        disabled={processingId === reservation.id}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#fff5f5",
                          color: "#c53030",
                          border: "1px solid #feb2b2",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: processingId === reservation.id ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        Anulează ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

export default MyReservations;
