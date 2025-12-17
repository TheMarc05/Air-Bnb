import api from "./api";
import type { Property } from "../types";

export const propertyService = {
  //obtine toate proprietatile active
  getAllProperties: async (
    city?: string,
    country?: string
  ): Promise<Property[]> => {
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (country) params.append("country", country);

    const response = await api.get<Property[]>(
      `/properties?${params.toString()}`
    );
    return response.data;
  },

  //obtine o proprietate dupa id
  getPropertyById: async (id: number): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  //obtine proprietatile utilizatorului curent
  getMyProperties: async (): Promise<Property[]> => {
    const response = await api.get<Property[]>("/properties/my-properties");
    return response.data;
  },

  //creeaza o proprietate noua
  createProperty: async (
    property: Omit<
      Property,
      "id" | "host" | "createdAt" | "updatedAt" | "isActive"
    >,
    images: File[]
  ): Promise<Property> => {
    const formData = new FormData();
    formData.append("property", JSON.stringify(property));
    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await api.post<Property>("/properties", formData);
    return response.data;
  },

  //actualizeaza o proprietate
  updateProperty: async (
    id: number,
    property: Partial<Property>,
    images?: File[]
  ): Promise<Property> => {
    const formData = new FormData();
    formData.append("property", JSON.stringify(property));
    if (images) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await api.put<Property>(`/properties/${id}`, formData);
    return response.data;
  },

  //sterge o proprietate
  deleteProperty: async (id: number): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },
};
