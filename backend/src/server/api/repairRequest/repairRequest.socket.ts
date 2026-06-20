import { Server as SocketServer } from 'socket.io';
import { appendAssistantMessage, finishChatSession, getChatSession } from '@/core/chatSession';
import { chatWithAssistant } from '@/core/chatSession/gemini';
import { cancelRepairRequest, assignBrandsToRequest } from '@/core/repairRequest';
import ChatSessionModel from '@/database/models/chatSession';
import CustomerModel from '@/database/models/customer';
import RepairRequestModel from '@/database/models/repairRequest';
import DeviceModel from '@/database/models/device';
import { log } from '@/log';
import axios from 'axios';

// ---------------------------------------------------------------------------
// Chat socket event names (shared contract with the frontend)
// ---------------------------------------------------------------------------
export const SOCKET_EVENTS = {
    NEW_MESSAGE: 'chat:newMessage',
    CHAT_FINISHED: 'chat:finished',
    TOOL_STARTED: 'chat:toolStarted',
} as const;

export interface ChatMessagePayload {
    role: 'user' | 'assistant';
    content: string;
    repairRequestId: string;
    createdAt: string;
}

export interface ChatFinishedPayload {
    repairRequestId: string;
    diagnosticReport: string[];
    isFinished: boolean;
}

// ---------------------------------------------------------------------------
// Simulate AI reply: persist → emit to customer's private room
// ---------------------------------------------------------------------------
export async function simulateAiReply(
    io: SocketServer,
    repairRequestId: string,
    customerId: string,
) {
    try {
        const session = await ChatSessionModel.findOne({ repairRequestId, customerId });
        if (!session) return;

        const customer = await CustomerModel.findById(customerId);
        if (!customer) return;

        const request = await RepairRequestModel.findById(repairRequestId);
        if (!request) return;

        const device = await DeviceModel.findById(request.deviceId);

        const { result: formattedSession } = await getChatSession(customer, repairRequestId);
        if (!formattedSession) return;

        const messages = await Promise.all(formattedSession.messages.map(async (m) => {
            const role = m.role === 'user' ? 'user' : 'model' as "user" | "model";
            const parts: any[] = [];

            if (m.type === 'text') {
                parts.push({ text: m.content });
            } else if (m.type === 'image' || m.type === 'voice') {
                try {
                    const response = await axios.get(m.content, { responseType: 'arraybuffer' });
                    const base64Data = Buffer.from(response.data).toString('base64');
                    parts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: m.mimetype || (m.type === 'image' ? 'image/jpeg' : 'audio/mpeg'),
                        },
                    });
                } catch (err) {
                    log.error(`Failed to fetch attachment for Gemini: ${m.content}`, err);
                    // Fallback to text if file fetch fails, or just skip
                    parts.push({ text: `[${m.type} attachment]` });
                }
            }

            return { role, parts };
        }));

        log.info(`[AI Chat] Sending ${messages.length} messages to Gemini API for request ${repairRequestId}...`);
        const startTime = Date.now();

        const response = await chatWithAssistant(messages, customer, device, (toolName) => {
            io.to(`customer:${customerId}`).emit(SOCKET_EVENTS.TOOL_STARTED, { toolName, repairRequestId });
        });
        const aiContent = response.text || '';

        log.info(`[AI Chat] Received reply from Gemini API in ${Date.now() - startTime}ms.`);

        const createdAt = new Date().toISOString();

        // 1. Persist the assistant message via core logic
        await appendAssistantMessage(repairRequestId, aiContent);

        // 2. Emit to the authenticated customer's private room
        const payload: ChatMessagePayload = {
            role: 'assistant',
            content: aiContent,
            repairRequestId,
            createdAt,
        };
        io.to(`customer:${customerId}`).emit(SOCKET_EVENTS.NEW_MESSAGE, payload);

        // 3. Extract diagnostic JSON if the AI has concluded the session.
        //    The system prompt outputs raw JSON (no code fence), but we also
        //    try a fenced ```json ... ``` block as a fallback for safety.
        let parsedJson: any = null;

        // Attempt 1: raw JSON block { ... } embedded in the text
        const rawJsonMatch = aiContent.match(/\{[\s\S]*"status"\s*:\s*"(?:technician_required|resolved)"[\s\S]*\}/);
        if (rawJsonMatch) {
            try {
                parsedJson = JSON.parse(rawJsonMatch[0]);
            } catch {
                // Not valid JSON — may be partial match, try fenced fallback
            }
        }

        // Attempt 2: fenced ```json ... ``` block (legacy / defensive fallback)
        if (!parsedJson) {
            const fencedMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (fencedMatch && fencedMatch[1]) {
                try {
                    parsedJson = JSON.parse(fencedMatch[1]);
                } catch {
                    log.error('[AI Chat] Found a ```json block but failed to parse it.');
                }
            }
        }

        if (parsedJson && parsedJson.status && parsedJson.diagnostic_report) {
            // ── Session concluded: persist report and notify frontend ──────────
            log.info(`[AI Chat] Session concluded with status="${parsedJson.status}" for request ${repairRequestId}`);

            try {
                await finishChatSession(customer, repairRequestId, parsedJson.diagnostic_report);

                if (parsedJson.status === 'resolved') {
                    await cancelRepairRequest(customer, repairRequestId);
                } else {
                    // 'technician_required' → forward to brands
                    await assignBrandsToRequest(repairRequestId);
                }

                const finishedPayload: ChatFinishedPayload = {
                    repairRequestId,
                    diagnosticReport: parsedJson.diagnostic_report,
                    isFinished: true,
                };

                io.to(`customer:${customerId}`).emit(SOCKET_EVENTS.CHAT_FINISHED, finishedPayload);
            } catch (err) {
                log.error(`[AI Chat] Failed to finalise session for request ${repairRequestId}:`, err);
            }
        } else if (parsedJson) {
            // Valid JSON found but missing status or diagnostic_report — chat continues
            log.warn(`[AI Chat] AI returned JSON but without status/diagnostic_report for request ${repairRequestId}. Chat continues.`);
        } else {
            // No JSON found — AI is still mid-conversation, chat continues normally
            log.info(`[AI Chat] No diagnostic JSON in response for request ${repairRequestId}. Chat continues.`);
        }

    } catch (error: any) {
        log.error(`[AI Chat Error] simulateAiReply failed: ${error?.message || error}`);
        if (error?.stack) log.error(error.stack);
    }
}
