import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

//interceptor pt a adauga token-ul JWT la fiecare cerere
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//interceptor pt a gestiona raspunsurile si erorile
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Dacă primim 401 și nu este o cerere de login/register și nu am încercat deja
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      // Verificăm dacă chiar avem ceva de șters. Dacă nu avem token, nu eram logați oricum.
      const hasToken = !!localStorage.getItem("token");

      if (hasToken && window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
