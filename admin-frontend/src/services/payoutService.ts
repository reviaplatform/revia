import { apiFetch } from "@/lib/api";

export interface PayoutListItem {
  id: string;
  brand: {
    id: string;
    name: {
      en: string;
      ar: string;
    };
  };
  requestedBy: {
    id: string;
    name: string;
  };
  amount: number;
  method: "bank" | "wallet" | "instapay";
  status: "sent" | "rejected" | "pending";
  instapayDestination?: {
    identifier: string;
    accountHolderName: string;
  } | null;
  bankDestination?: {
    bankName: string;
    accountHolderName: string;
    iban: string;
    accountNumber: string;
  } | null;
  walletDestination?: {
    walletProvider: string;
    phoneNumber: string;
    accountHolderName: string;
  } | null;
  processedBy?: {
    id: string;
    name: string;
  } | null;
  processedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
}

export interface WalletTransactionItem {
  id: string;
  brandId: string;
  type: string;
  direction: "debit" | "credit";
  amount: number;
  balanceAfter: number;
  paymentId: string | null;
  payoutId: string | null;
  repairRequestId: string | null;
  note: string;
  createdAt: string;
}

export type GetPayoutsResponse = {
  data?: PayoutListItem[];
  items?: PayoutListItem[];
  results?: PayoutListItem[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type GetWalletTransactionsResponse = {
  data?: WalletTransactionItem[];
  items?: WalletTransactionItem[];
  results?: WalletTransactionItem[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export const payoutService = {
  getPayouts: (page = 1, limit = 20, status?: string) => {
    let url = `/payouts?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiFetch<GetPayoutsResponse | PayoutListItem[]>(url, {
      method: "GET",
    });
  },

  markAsSent: (id: string) =>
    apiFetch<{ message?: string }>(`/payouts/${id}/send`, {
      method: "PATCH",
    }),

  reject: (id: string) =>
    apiFetch<{ message?: string }>(`/payouts/${id}/reject`, {
      method: "PATCH",
    }),

  getWalletTransactions: (page = 1, limit = 20, brandId?: string) => {
    let url = `/payouts/wallet/transactions?page=${page}&limit=${limit}`;
    if (brandId) url += `&brandId=${brandId}`;
    return apiFetch<GetWalletTransactionsResponse | WalletTransactionItem[]>(url, {
      method: "GET",
    });
  },
};
