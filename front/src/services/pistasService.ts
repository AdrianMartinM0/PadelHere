import { apiClient } from "../api/apiClient";
import type { Court } from "../components/Profile/Club/Pistas";
import type { DayConfigInput, Reserva } from "../components/Profile/Club/PistasUtils";

export const pistasService = {
  // Obtener datos iniciales del club (pistas, config semanal y overrides)
  getCourtsAndConfigs: async (clubId: string) => {
    return Promise.all([
      apiClient.request<{ courts: Court[] }>(`/club/${clubId}/pistas`),
      apiClient.request<{ globalDays: { [day: string]: DayConfigInput }; [key: string]: unknown }>(`/club/${clubId}/config`),
      apiClient.request<{ [date: string]: DayConfigInput }>(`/club/${clubId}/overrides`),
    ]);
  },

  // Overrides globales por fecha específica
  getGlobalOverrides: async (clubId: string) => {
    return apiClient.request<{ [date: string]: DayConfigInput }>(`/club/${clubId}/overrides`);
  },

  setGlobalOverride: async (clubId: string, date: string, payload: DayConfigInput) => {
    return apiClient.request(`/club/${clubId}/overrides/${date}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteGlobalOverride: async (clubId: string, date: string) => {
    return apiClient.request(`/club/${clubId}/overrides/${date}`, {
      method: "DELETE",
    });
  },

  // Configuración general del club
  updateClubConfig: async (clubId: string, globalDays: Record<string, DayConfigInput>) => {
    return apiClient.request(`/club/${clubId}/config`, {
      method: "POST",
      body: JSON.stringify({ globalDays }),
    });
  },

  // Configuración de horarios de una pista individual
  updateCourtConfig: async (courtId: string, days: Record<string, DayConfigInput>) => {
    return apiClient.request(`/pista/${courtId}/config`, {
      method: "POST",
      body: JSON.stringify({ days }),
    });
  },

  // CRUD de pistas
  createCourt: async (clubId: string, courtData: Partial<Court>) => {
    return apiClient.request<Court>(`/club/${clubId}/pistas`, {
      method: "POST",
      body: JSON.stringify(courtData),
    });
  },

  updateCourt: async (courtId: string, courtData: Partial<Court>) => {
    return apiClient.request(`/pista/${courtId}`, {
      method: "PUT",
      body: JSON.stringify(courtData),
    });
  },

  deleteCourt: async (courtId: string) => {
    return apiClient.request(`/pista/${courtId}`, {
      method: "DELETE",
    });
  },

  // Creación y asignación de reserva
  createReserva: async (courtId: string, payload: unknown) => {
    return apiClient.request<Reserva>(`/pista/${courtId}/reservas`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  linkReservaUsuario: async (userId: string, reservaId: string) => {
    return apiClient.request(`/usuario/${userId}/reservas/${reservaId}`, {
      method: "POST",
    });
  },
};
