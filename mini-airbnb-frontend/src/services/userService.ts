import api from "./api";
import type { User, UserRole } from "../types";

export const userService = {
  // Obține toți utilizatorii (doar Admin)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  // Schimbă rolul unui utilizator (doar Admin)
  updateUserRole: async (userId: number, role: UserRole): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Șterge un utilizator (doar Admin)
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

