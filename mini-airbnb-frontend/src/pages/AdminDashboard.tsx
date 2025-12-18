import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { UserRole } from "../types";
import type { User } from "../types";
import ConfirmationModal from "../components/ConfirmationModal";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
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
    if (!isAuthenticated || user?.role !== UserRole.ROLE_ADMIN) {
      navigate("/");
      return;
    }

    loadUsers().then(() => setIsVisible(true));
  }, [isAuthenticated, user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      showToast("Eroare la încărcarea utilizatorilor.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, currentRole: UserRole) => {
    const nextRole = currentRole === UserRole.ROLE_GUEST ? UserRole.ROLE_HOST : UserRole.ROLE_GUEST;
    const roleLabel = nextRole === UserRole.ROLE_HOST ? "Gazdă" : "Oaspete";

    setModalConfig({
      isOpen: true,
      title: "Schimbă rolul",
      message: `Vrei să schimbi rolul utilizatorului în ${roleLabel}?`,
      type: "info",
      onConfirm: async () => {
        try {
          setProcessingId(userId);
          await userService.updateUserRole(userId, nextRole);
          showToast(`Rol actualizat în ${roleLabel}!`, "success");
          await loadUsers();
        } catch (err: any) {
          showToast("Eroare la actualizarea rolului.", "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (userId === user?.id) {
      showToast("Nu te poți șterge pe tine însuți!", "warning");
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Șterge utilizator",
      message: `Ești sigur că vrei să ștergi utilizatorul ${email}? Această acțiune este ireversibilă.`,
      type: "danger",
      onConfirm: async () => {
        try {
          setProcessingId(userId);
          await userService.deleteUser(userId);
          showToast("Utilizator șters.", "info");
          await loadUsers();
        } catch (err: any) {
          showToast(err.response?.data || "Eroare la ștergerea utilizatorului.", "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  if (!isAuthenticated || user?.role !== UserRole.ROLE_ADMIN) {
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
          }}
        >
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" style={{ marginRight: "8px" }}>
            <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 7.163 16 16 16s16-7.163 16-16C32 7.163 24.837 0 16 0z" fill="#FF385C" />
            <path d="M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="#fff" />
          </svg>
          <span>airbnb <span style={{ color: "#222", fontSize: "14px", fontWeight: "400" }}>| Admin</span></span>
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ← Înapoi la Site
        </Link>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "56px 40px 80px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: "600", color: "#222", marginBottom: "12px" }}>
          Admin Dashboard 🔐
        </h1>
        <p style={{ fontSize: "15px", color: "#717171", marginBottom: "48px" }}>
          Gestionează utilizatorii platformei și permisiunile acestora.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#717171" }}>Se încarcă utilizatorii...</div>
        ) : (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              border: "1px solid #ebebeb",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.5s ease-out",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #ebebeb" }}>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: "600", color: "#717171", textTransform: "uppercase" }}>Utilizator</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: "600", color: "#717171", textTransform: "uppercase" }}>Email</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: "600", color: "#717171", textTransform: "uppercase" }}>Rol</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: "600", color: "#717171", textTransform: "uppercase", textAlign: "right" }}>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #ebebeb", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fcfcfc")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ fontWeight: "600", color: "#222" }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: "12px", color: "#717171" }}>ID: #{u.id}</div>
                    </td>
                    <td style={{ padding: "20px 24px", color: "#222" }}>{u.email}</td>
                    <td style={{ padding: "20px 24px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: u.role === UserRole.ROLE_ADMIN ? "#f0f9ff" : u.role === UserRole.ROLE_HOST ? "#f0fdf4" : "#f7f7f7",
                          color: u.role === UserRole.ROLE_ADMIN ? "#0284c7" : u.role === UserRole.ROLE_HOST ? "#16a34a" : "#717171",
                        }}
                      >
                        {u.role.replace("ROLE_", "")}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {u.role !== UserRole.ROLE_ADMIN && (
                          <button
                            onClick={() => handleRoleChange(u.id, u.role)}
                            disabled={processingId === u.id}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "transparent",
                              border: "1px solid #ddd",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#222")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
                          >
                            Schimbă Rol
                          </button>
                        )}
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={processingId === u.id}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#fff5f5",
                              color: "#c53030",
                              border: "1px solid #feb2b2",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
                          >
                            Șterge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default AdminDashboard;

