import { apiFetch } from "@/lib/api";

export enum SupportTicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum SupportTicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum SupportTicketSenderType {
  CUSTOMER = "Customer",
  BRAND = "Brand",
}

export interface SupportTicket {
  id: string;
  senderType: SupportTicketSenderType;
  customerId?: string;
  customerName?: string;
  brandId?: string;
  brandName?: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketsListResponse {
  status: "success" | "error";
  data: SupportTicket[];
}

export interface SupportTicketResponse {
  status: "success" | "error";
  data: SupportTicket;
}

export interface UpdateTicketPayload {
  status: SupportTicketStatus;
  adminNote?: string;
}

export const supportService = {
  /**
   * Retrieve all support tickets from both customers and brands.
   */
  getAllTickets: () =>
    apiFetch<SupportTicketsListResponse>("/support", {
      method: "GET",
    }),

  /**
   * Update the status of a support ticket and optionally add an internal admin note.
   */
  updateTicketStatus: (id: string, payload: UpdateTicketPayload) =>
    apiFetch<SupportTicketResponse>(`/support/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
