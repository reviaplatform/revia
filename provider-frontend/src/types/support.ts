export enum SupportTicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export enum SupportTicketSenderType {
    CUSTOMER = 'Customer',
    BRAND = 'Brand',
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

// API Response Wrappers
export interface SupportTicketResponse {
    status: 'success' | 'error';
    data: SupportTicket;
}

export interface SupportTicketsListResponse {
    status: 'success' | 'error';
    data: SupportTicket[];
}
