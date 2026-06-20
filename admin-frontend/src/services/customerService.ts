import { apiFetch } from "@/lib/api";

export interface CustomerListItem {
  id: string;
  name: string;
  picture: string | null;
  phoneNumber: string;
  status: string;
  email: string;
  languagePreference: string;
  gender: "male" | "female";
  birthday: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _id?: string;
}

export type GetCustomerListResponse = {
  data?: CustomerListItem[] | { customers?: CustomerListItem[] } | any;
  customers?: CustomerListItem[];
  results?: CustomerListItem[];
  items?: CustomerListItem[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export const customerService = {
  getCustomerList: (page = 1, limit = 20) =>
    apiFetch<GetCustomerListResponse | CustomerListItem[]>(
      `/account/customer-list?page=${page}&limit=${limit}`,
      { method: "GET" }
    ),

  getCustomerById: (id: string) =>
    apiFetch<CustomerListItem | { data: CustomerListItem }>(
      `/account/${id}/customer`,
      { method: "GET" }
    ),

  banCustomer: (id: string) =>
    apiFetch<{ message?: string }>(`/account/${id}/ban-customer`, {
      method: "DELETE",
    }),

  unbanCustomer: (id: string) =>
    apiFetch<{ message?: string }>(`/account/${id}/unban-customer`, {
      method: "POST",
    }),

  restoreCustomer: (id: string) =>
    apiFetch<{ message?: string }>(`/account/${id}/restore-customer`, {
      method: "POST",
    }),
};
