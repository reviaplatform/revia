import { apiFetch } from "@/lib/api";

export interface Admin {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  lastLoginAt: string | null;
  role: "admin" | "manager";
  languagePreference: string;
  createdAt: string;
  deletedAt: string | null;
  status?: string;
  _id?: string;
}

export interface AdminListResponse {
  data?: Admin[] | { admins?: Admin[] };
  admins?: Admin[];
  results?: Admin[];
  items?: Admin[];
  page?: number;
  total?: number;
}

export type CreateAdminPayload = {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
};

export type UpdateAdminPayload = {
  role?: string;
};

export const adminService = {
  getAdminList: (page = 1, limit = 20) =>
    apiFetch<AdminListResponse | Admin[]>(`/account/admin-list?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getAdminById: (id: string) =>
    apiFetch<Admin | { data: Admin }>(`/account/${id}/admin`, {
      method: "GET",
    }),

  createAdmin: (payload: CreateAdminPayload) =>
    apiFetch<{ message?: string; data?: Admin }>(`/account/create-admin`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateAdmin: (id: string, payload: UpdateAdminPayload) =>
    apiFetch<{ message?: string; data?: Admin }>(`/account/${id}/update-admin`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  banAdmin: (id: string) =>
    apiFetch<{ message?: string }>(`/account/${id}/ban-admin`, {
      method: "DELETE",
    }),

  unbanAdmin: (id: string) =>
    apiFetch<{ message?: string }>(`/account/${id}/unban-admin`, {
      method: "POST",
    }),
};
