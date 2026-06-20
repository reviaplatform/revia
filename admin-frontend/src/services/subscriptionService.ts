import { apiFetch } from "@/lib/api";

export type SubscriptionStatus = "pending_payment" | "active" | "expired";

export interface Subscription {
  id: string;
  brandId: string;
  brandName?: {
    en: string;
    ar: string;
  };
  status: SubscriptionStatus;
  price: number;
  durationDays: number;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionConfig {
  priceEGP: number;
  durationDays: number;
}

export interface SubscriptionListResponse {
  data: Subscription[];
}

export interface SubscriptionConfigResponse {
  data: SubscriptionConfig;
}

export const subscriptionService = {
  getConfig: () =>
    apiFetch<SubscriptionConfigResponse>(`/subscription-config`, {
      method: "GET",
    }),

  updateConfig: (payload: SubscriptionConfig) =>
    apiFetch<SubscriptionConfigResponse>(`/subscription-config`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getSubscriptions: (status?: SubscriptionStatus) => {
    const query = status ? `?status=${status}` : "";
    return apiFetch<SubscriptionListResponse>(`/subscriptions${query}`, {
      method: "GET",
    });
  },

  markAsPaid: (id: string) =>
    apiFetch<{ data: Subscription }>(`/subscriptions/${id}/mark-paid`, {
      method: "PATCH",
    }),
};
