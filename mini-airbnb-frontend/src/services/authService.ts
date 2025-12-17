import api from "./api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types";

export const authService = {
  //login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  //register
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  },

  //logout (doar sterge token-ul din localStorage)
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  //verifica daca utilizatorul este autentificat
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  //obtine token ul din localStorage
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  //salveaza token-ul si datele utilizatorului in localStorage
  saveAuthData: (authResponse: AuthResponse): void => {
    localStorage.setItem("token", authResponse.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: authResponse.id,
        email: authResponse.email,
        role: authResponse.role,
      })
    );
  },

  //devino host
  becomeHost: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/become-host");
    return response.data;
  },
};
