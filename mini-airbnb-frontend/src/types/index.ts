//user types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export type UserRole = "ROLE_ADMIN" | "ROLE_HOST" | "ROLE_GUEST";

export const UserRole = {
  ROLE_ADMIN: "ROLE_ADMIN" as const,
  ROLE_HOST: "ROLE_HOST" as const,
  ROLE_GUEST: "ROLE_GUEST" as const,
} as const;

//property types
export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  isActive: boolean;
  host: User;
  createdAt: string;
  updatedAt: string;
}

//reservation types
export interface Reservation {
  id: number;
  property: Property;
  guest: User;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export const ReservationStatus = {
  PENDING: "PENDING" as const,
  CONFIRMED: "CONFIRMED" as const,
  CANCELLED: "CANCELLED" as const,
  COMPLETED: "COMPLETED" as const,
} as const;

//auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  type: string;
  email: string;
  role: string;
}

//reservation request
export interface ReservationRequest {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}
