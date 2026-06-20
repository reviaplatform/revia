import { apiClient } from './client';
import { ChatMessage, ApiResponse, ChatSession } from './types';

export const getChatMessages = async (requestId: string): Promise<ChatSession> => {
  const response = await apiClient.get<ApiResponse<ChatSession>>(`repair-requests/${requestId}/chat`);
  return response.data.data;
};

export const sendChatMessage = async (
  requestId: string, 
  content: string, 
  type: 'text' | 'image' | 'voice' | 'system' = 'text',
  attachments?: File[]
): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('type', type);
  
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const response = await apiClient.post<ApiResponse<ChatMessage>>(
    `repair-requests/${requestId}/chat/messages`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

export const closeChatSession = async (requestId: string, closeRequest: boolean = true): Promise<{ isClosed: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ isClosed: boolean }>>(`repair-requests/${requestId}/chat/finish`, {
    closeRequest
  });
  return response.data.data;
};
