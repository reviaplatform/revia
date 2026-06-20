export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  brandId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
