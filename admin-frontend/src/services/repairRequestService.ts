import { apiFetch } from "@/lib/api";

export interface RepairRequestItem {
  id: string;
  customerId: string;
  deviceId: string;
  deviceName: string;
  issueText: string;
  flow: "ai_chat" | "direct" | string;
  status: string;
  aiReport?: string[];
  statusLogs?: {
    status: string;
    timestamp: string;
  }[];
  selectedOfferId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type RepairRequestListResponse = {
  data?: RepairRequestItem[];
  items?: RepairRequestItem[];
  results?: RepairRequestItem[];
  page?: number;
  limit?: number;
  total?: number;
};

export const repairRequestService = {
  getList: (page: number = 1, limit: number = 20) =>
    apiFetch<RepairRequestListResponse | RepairRequestItem[]>(`/repair-requests?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getSingle: (requestId: string) =>
    apiFetch<RepairRequestItem | any>(`/repair-requests/${requestId}`, {
      method: "GET",
    }),

  getInspection: (requestId: string) =>
    apiFetch<any>(`/repair-requests/${requestId}/inspection`, {
      method: "GET",
    }),
};
