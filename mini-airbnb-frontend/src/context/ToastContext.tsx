import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              pointerEvents: "auto",
              backgroundColor: "#222",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: "12px",
              boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "300px",
              maxWidth: "90vw",
              animation:
                "toastSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              cursor: "pointer",
              border: toast.type === "error" ? "1px solid #FF385C" : "none",
            }}
          >
            <div style={{ fontSize: "20px" }}>
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "❌"}
              {toast.type === "info" && "ℹ️"}
              {toast.type === "warning" && "⚠️"}
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.4" }}
            >
              {toast.message}
            </div>
          </div>
        ))}
      </div>
      <style>
        {`
          @keyframes toastSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
