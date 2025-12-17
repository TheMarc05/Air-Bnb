import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { propertyService } from "../services/propertyService";
import { UserRole } from "../types";
import type { Property } from "../types";

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState<
    Omit<Property, "id" | "host" | "createdAt" | "updatedAt" | "isActive">
  >({
    title: "",
    description: "",
    address: "",
    city: "",
    country: "",
    pricePerNight: 0,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 1,
    imageUrls: [],
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

    if (id) {
      loadProperty();
    }
  }, [isAuthenticated, user, id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const property = await propertyService.getPropertyById(Number(id));
      setFormData({
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        country: property.country,
        pricePerNight: property.pricePerNight,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        imageUrls: property.imageUrls || [],
      });
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Eroare la încărcarea proprietății.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "pricePerNight" ||
        name === "bedrooms" ||
        name === "bathrooms" ||
        name === "maxGuests"
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (urlToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((url) => url !== urlToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await propertyService.updateProperty(Number(id), formData, selectedFiles);
      showToast("Proprietatea a fost actualizată cu succes!", "success");
      navigate("/my-properties");
    } catch (err: any) {
      console.error("Update property error:", err);
      const errorMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message ||
        "Eroare la actualizarea proprietății. Te rugăm să încerci din nou.";
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (
    user?.role !== UserRole.ROLE_HOST &&
    user?.role !== UserRole.ROLE_ADMIN
  ) {
    return null;
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#717171", fontSize: "15px" }}>
          Se încarcă...
        </div>
      </div>
    );
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
          to="/my-properties"
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
          maxWidth: "840px",
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
          Editează proprietatea
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#717171",
            marginBottom: "48px",
            lineHeight: "1.5",
          }}
        >
          Actualizează informațiile despre proprietatea ta
        </p>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="title"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#222",
              }}
            >
              Titlu *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
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
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="description"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#222",
              }}
            >
              Descriere *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              style={{
                width: "100%",
                padding: "14px 16px",
                boxSizing: "border-box",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "15px",
                color: "#222",
                fontFamily: "inherit",
                resize: "vertical",
                transition: "border-color 0.2s, box-shadow 0.2s",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#222";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#222",
              }}
            >
              Imagini Proprietate
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange(e.dataTransfer.files);
              }}
              onClick={() => document.getElementById("fileInput")?.click()}
              style={{
                border: "2px dashed #ddd",
                borderRadius: "12px",
                padding: "40px 20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "#fafafa",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#222";
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.backgroundColor = "#fafafa";
              }}
            >
              <input
                id="fileInput"
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📸</div>
              <p style={{ fontWeight: "600", color: "#222", margin: "0 0 4px 0" }}>
                Trage pozele noi aici sau fă click pentru a selecta
              </p>
              <p style={{ color: "#717171", fontSize: "14px", margin: 0 }}>
                Adaugă poze noi la cele existente
              </p>
            </div>

            {/* Existing and New Previews */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {/* Existing Images */}
              {formData.imageUrls.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  <img
                    src={url}
                    alt={`Existing ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingImage(url);
                    }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,56,92,0.9)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* New File Previews */}
              {previews.map((url, index) => (
                <div
                  key={`new-${index}`}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #222",
                  }}
                >
                  <img
                    src={url}
                    alt={`New ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                    }}
                  >
                    ✕
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      right: "0",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      fontSize: "10px",
                      padding: "2px 4px",
                      textAlign: "center",
                    }}
                  >
                    Nou
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="address"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#222",
              }}
            >
              Adresă *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
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
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* City and Country */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <label
                htmlFor="city"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                Oraș *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
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
            <div>
              <label
                htmlFor="country"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                Țară *
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
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

          {/* Price Per Night */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="pricePerNight"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#222",
              }}
            >
              Preț pe noapte (€) *
            </label>
            <input
              id="pricePerNight"
              name="pricePerNight"
              type="number"
              min="1"
              step="0.01"
              value={formData.pricePerNight}
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
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Bedrooms, Bathrooms, Max Guests */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div>
              <label
                htmlFor="bedrooms"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                Dormitoare *
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="1"
                value={formData.bedrooms}
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
            <div>
              <label
                htmlFor="bathrooms"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                Băi *
              </label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="1"
                step="0.5"
                value={formData.bathrooms}
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
            <div>
              <label
                htmlFor="maxGuests"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                Oaspeți max *
              </label>
              <input
                id="maxGuests"
                name="maxGuests"
                type="number"
                min="1"
                value={formData.maxGuests}
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

          {/* Submit Button */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "48px",
              paddingTop: "32px",
              borderTop: "1px solid #ebebeb",
            }}
          >
            <Link
              to="/my-properties"
              style={{
                padding: "14px 28px",
                backgroundColor: "transparent",
                color: "#222",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "15px",
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
              Anulează
            </Link>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "14px 28px",
                backgroundColor: saving ? "#ddd" : "#222",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = "#000";
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = "#222";
                }
              }}
            >
              {saving ? "Se salvează..." : "Salvează modificările"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;

