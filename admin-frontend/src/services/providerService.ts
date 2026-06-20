import { apiFetch } from "@/lib/api";

export interface ProviderListItem {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  lastLoginAt: string | null;
  role: "owner";
  languagePreference: string;
  createdAt: string;
  brand: {
    en: string;
    ar: string;
  };
  status?: string;
  _id?: string;
}

export type GetProviderListResponse = {
  data?: ProviderListItem[] | { providers?: ProviderListItem[] } | any;
  providers?: ProviderListItem[];
  results?: ProviderListItem[];
  items?: ProviderListItem[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type CreateProviderPayload = {
  name?: string;
  businessName?: string;
  email: string;
  phoneNumber: string;
  status?: string;
};

export type UpdateProviderPayload = {
  status?: string;
  businessName?: string;
  email?: string;
};

export const providerService = {
  getProviderList: (page = 1, limit = 20) =>
    apiFetch<GetProviderListResponse | ProviderListItem[]>(
      `/account/provider-list?page=${page}&limit=${limit}`,
      { method: "GET" }
    ),

  getProviderById: (id: string) =>
    apiFetch<ProviderListItem | { data: ProviderListItem }>(
      `/account/${id}/provider`,
      { method: "GET" }
    ),

  createProvider: (payload: CreateProviderPayload) =>
    apiFetch<{ message?: string; data?: ProviderListItem }>(
      `/account/create-provider`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  updateProvider: (id: string, payload: UpdateProviderPayload) =>
    apiFetch<{ message?: string; data?: ProviderListItem }>(
      `/account/${id}/update-provider`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),

  suspendProvider: (id: string) =>
    apiFetch<{ message?: string }>(`/account/${id}/suspend-provider`, {
      method: "DELETE",
    }),

  activateProvider: (id: string) =>
    apiFetch<{ message?: string }>(`/account/${id}/activate-provider`, {
      method: "POST",
    }),
};
