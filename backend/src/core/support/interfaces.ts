import { SupportTicketPriority, SupportTicketStatus, SupportTicketSenderType } from '@/database/models/supportTicket';

export interface CreateSupportTicketData {
    subject: string;
    message: string;
    priority?: SupportTicketPriority;
}

export interface UpdateSupportTicketStatusData {
    status: SupportTicketStatus;
    adminNote?: string;
}

export interface SupportTicketResult {
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
