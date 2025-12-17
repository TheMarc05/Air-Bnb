import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    if (error.response?.status === 401) {
      //token expirat sau invalid, sterge tonken-ul si redirect catre login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
