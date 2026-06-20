import { Server as SocketServer } from 'socket.io';
import { chatWithBrandAssistant } from '@/core/brandChat/gemini';
import BrandChatSessionModel from '@/database/models/brandChatSession';
import BrandModel from '@/database/models/brand';
import { ChatRole, IChatMessage } from '@/database/models/chatSession';
import { getFileUrl } from '@/core/utils/storage';
import { converToTimeZone } from '@/core/utils/functions';
import axios from 'axios';
import { log } from '@/log';

export const BRAND_CHAT_EVENTS = {
    NEW_MESSAGE: 'brandChat:newMessage',
    TOOL_STARTED: 'brandChat:toolStarted',
} as const;

export interface BrandChatMessagePayload {
    role: string;
    content: string;
    type: string;
    mimetype?: string;
    createdAt: string;
}

/**
 * Simulate AI reply for a specific provider's brand chat session.
 * Emits to the provider's private room so only that provider receives the reply.
 */
export async function simulateBrandAiReply(
    io: SocketServer,
    brandId: string,
    providerId: string,
) {
    try {
        // Find the latest session scoped to this specific provider
        const session = await BrandChatSessionModel.findOne({ brandId, providerId }).sort({ createdAt: -1 });
        if (!session) return;

        const brand = await BrandModel.findById(brandId);
        if (!brand) return;

        // Build history for Gemini
        const messages = await Promise.all(session.messages.map(async (msg: IChatMessage) => {
            const role = msg.role === ChatRole.USER ? 'user' : 'model' as 'user' | 'model';
            const parts: any[] = [];

            if (msg.type === 'text') {
                parts.push({ text: msg.content });
            } else if (msg.type === 'image' || msg.type === 'voice') {
                try {
                    const url = await getFileUrl(msg.content);
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const base64Data = Buffer.from(response.data).toString('base64');
                    parts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: msg.mimetype || (msg.type === 'image' ? 'image/jpeg' : 'audio/webm'),
                        },
                    });
                } catch (err) {
                    log.error(`Failed to fetch brand chat attachment for Gemini: ${msg.content}`, err);
                    parts.push({ text: `[${msg.type} attachment]` });
                }
            }

            return { role, parts };
        }));

        log.info(`[Brand AI Chat] Sending ${messages.length} messages to Gemini for provider ${providerId} (brand ${brandId})...`);
        const startTime = Date.now();

        const response = await chatWithBrandAssistant(messages, (toolName) => {
            // Emit to provider's private room
            io.to(`provider:${providerId}`).emit(BRAND_CHAT_EVENTS.TOOL_STARTED, { toolName });
        });
        const aiContent = response.text || '';

        log.info(`[Brand AI Chat] Received reply in ${Date.now() - startTime}ms for provider ${providerId}.`);

        const createdAt = new Date();

        // Persist the assistant message
        session.messages.push({
            role: ChatRole.ASSISTANT,
            content: aiContent,
            type: 'text',
            createdAt,
        });
        await session.save();

        // Emit only to this provider's private room
        const payload: BrandChatMessagePayload = {
            role: ChatRole.ASSISTANT,
            content: aiContent,
            type: 'text',
            createdAt: converToTimeZone(createdAt),
        };
        io.to(`provider:${providerId}`).emit(BRAND_CHAT_EVENTS.NEW_MESSAGE, payload);

    } catch (error: any) {
        log.error(`[Brand AI Chat Error] simulateBrandAiReply failed: ${error?.message || error}`);
        if (error?.stack) log.error(error.stack);
    }
}
