import { apiClient } from './client';
import { SupportTicket, CreateSupportTicketPayload, SupportTicketsListResponse, SupportTicketResponse } from './types';

export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  const response = await apiClient.get<SupportTicketsListResponse>('support');
  return response.data.data;
};

export const createSupportTicket = async (data: CreateSupportTicketPayload): Promise<SupportTicket> => {
  const response = await apiClient.post<SupportTicketResponse>('support', data);
  return response.data.data;
};
