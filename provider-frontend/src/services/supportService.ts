import { apiClient } from '@/lib/api';
import { 
    SupportTicket, 
    SupportTicketResponse, 
    SupportTicketsListResponse 
} from '@/types/support';

export const supportService = {
    /**
     * List all support tickets for the current brand
     */
    getTickets: async (): Promise<SupportTicket[]> => {
        const response = await apiClient.get<SupportTicketsListResponse>('/support');
        return response.data.data;
    },

    /**
     * Create a new support ticket
     */
    createTicket: async (data: {
        subject: string;
        message: string;
        priority: string;
    }): Promise<SupportTicket> => {
        const response = await apiClient.post<SupportTicketResponse>('/support', data);
        return response.data.data;
    },

    /**
     * Get a specific support ticket by ID
     */
    getTicketById: async (id: string): Promise<SupportTicket> => {
        const response = await apiClient.get<SupportTicketResponse>(`/support/${id}`);
        return response.data.data;
    }
};
