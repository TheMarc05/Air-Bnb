import api from "./api";
import type { Reservation, ReservationRequest } from "../types";

export const reservationService = {
  // Creează o rezervare
  createReservation: async (
    request: ReservationRequest
  ): Promise<Reservation> => {
    const response = await api.post<Reservation>("/reservations", request);
    return response.data;
  },

  // Obține rezervările utilizatorului curent
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>("/reservations/my-reservations");
    return response.data;
  },

  // Obține rezervările pentru proprietățile host-ului
  getHostReservations: async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>(
      "/reservations/host-reservations"
    );
    return response.data;
  },

  // Confirmă o rezervare (pentru host)
  confirmReservation: async (reservationId: number): Promise<Reservation> => {
    const response = await api.put<Reservation>(
      `/reservations/${reservationId}/confirm`
    );
    return response.data;
  },

  // Finalizează o rezervare (pentru host)
  completeReservation: async (reservationId: number): Promise<Reservation> => {
    const response = await api.put<Reservation>(
      `/reservations/${reservationId}/complete`
    );
    return response.data;
  },

  // Anulează o rezervare
  cancelReservation: async (reservationId: number): Promise<Reservation> => {
    const response = await api.put<Reservation>(
      `/reservations/${reservationId}/cancel`
    );
    return response.data;
  },

  // Obține rezervările pentru o proprietate
  getReservationsByProperty: async (
    propertyId: number
  ): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>(
      `/reservations/property/${propertyId}`
    );
    return response.data;
  },

  // Obține o rezervare după ID
  getReservationById: async (id: number): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  // Obține perioadele ocupate pentru o proprietate
  getBusyDatesByProperty: async (propertyId: number): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>(
      `/reservations/property/${propertyId}/busy-dates`
    );
    return response.data;
  },
};

