import { apiFetch } from "@/lib/api";

export interface CategoryListItem {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  commissionPerRequest: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryListResponse = {
  data: CategoryListItem[];
  page?: number;
  limit?: number;
  total?: number;
};

export const categoryAdminApi = {
  getList: (page: number = 1, limit: number = 20) =>
    apiFetch<CategoryListResponse | CategoryListItem[]>(`/category/list?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  create: (payload: { name: { en: string; ar: string }; commissionPerRequest: number }) =>
    apiFetch<CategoryListItem | any>("/category/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (
    id: string,
    payload: { name?: { en: string; ar: string }; commissionPerRequest?: number; isActive?: boolean }
  ) =>
    apiFetch<CategoryListItem | any>(`/category/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    apiFetch<{ message?: string }>(`/category/${id}/delete`, {
      method: "DELETE",
    }),
};
