import { ChatRole } from '@/database/models/chatSession';

export interface SendMessageData {
    content: string;
    type?: 'text' | 'image' | 'voice' | 'system';
    files?: {
        buffer: Buffer;
        mimetype: string;
    }[];
}

export interface ChatMessageResult {
    role: ChatRole;
    content: string;
    type: 'text' | 'image' | 'voice' | 'system';
    mimetype?: string;
    createdAt: string;
}

export interface ChatSessionResult {
    id: string;
    repairRequestId: string;
    customerId: string;
    messages: ChatMessageResult[];
    isFinished: boolean;
    aiReport: string[];
    createdAt: string;
    updatedAt: string;
}
