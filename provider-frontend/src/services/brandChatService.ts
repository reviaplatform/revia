import { apiClient } from '@/lib/api';
import { ChatSession } from '@/types/brandChat';

export const brandChatService = {
  getSession: async (): Promise<ChatSession> => {
    const response = await apiClient.get('/brand-chat');
    return response.data.data;
  },

  sendMessage: async (content?: string, file?: File): Promise<ChatSession> => {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    const response = await apiClient.post('/brand-chat/message', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  startNewSession: async (): Promise<ChatSession> => {
    const response = await apiClient.post('/brand-chat/new');
    return response.data.data;
  },
};
