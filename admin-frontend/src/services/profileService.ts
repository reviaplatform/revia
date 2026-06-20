import { apiFetch, LanguagePreference } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  languagePreference: LanguagePreference;
}

export interface UpdateProfilePayload {
  name: string;
  languagePreference?: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confNewPassword: string;
}

export const profileApi = {
  getMyProfile: async () => {
    const response = await apiFetch<{ data: UserProfile }>("/me", {
      method: "GET",
    });
    return response.data;
  },

  updateMyProfile: (payload: UpdateProfilePayload) =>
    apiFetch<{ message?: string; data?: UserProfile }>("/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateMyPassword: (payload: UpdatePasswordPayload) =>
    apiFetch<{ message?: string }>("/me/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
