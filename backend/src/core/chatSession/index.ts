import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { ICustomerDB } from '@/database/models/customer';
import ChatSessionModel, { IChatSessionDB, ChatRole } from '@/database/models/chatSession';
import RepairRequestModel, { RepairRequestFlow, RepairRequestStatus } from '@/database/models/repairRequest';
import { ChatSessionResult, SendMessageData } from './interfaces';
import { uploadFile, getFileUrl } from '@/core/utils/storage';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Customer: start a chat session for a Flow 2 repair request
// ---------------------------------------------------------------------------
export async function startChatSession(
    customer: ICustomerDB,
    requestId: string,
): AsyncSafeResult<boolean> {
    try {
        const req = await RepairRequestModel.findOne({ _id: requestId, customerId: customer._id });
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.flow !== RepairRequestFlow.AI_CHAT) throw ApiError.invalidRepairRequestStatus();

        // Prevent duplicate sessions
        const existing = await ChatSessionModel.findOne({ repairRequestId: requestId, isFinished: false });
        if (existing) return { result: false, error: null };

        await ChatSessionModel.create({
            repairRequestId: requestId,
            customerId: customer._id,
        });

        return { result: true, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: send a message in an active chat session
// ---------------------------------------------------------------------------
export async function sendMessage(
    customer: ICustomerDB,
    repairRequestId: string,
    data: SendMessageData,
): AsyncSafeResult<ChatSessionResult> {
    try {
        const session = await ChatSessionModel.findOne({
            repairRequestId,
            customerId: customer._id,
        });
        if (!session) throw ApiError.notFoundChatSession();

        if (session.isFinished) return { result: await _formatChatSession(session), error: null };

        // 1. Store text content if provided
        if (data.content && data.content.trim() !== '') {
            session.messages.push({
                role: ChatRole.USER,
                content: data.content,
                type: data.type || 'text',
                createdAt: new Date(),
            });
        }

        // 2. Handle file uploads if any
        if (data.files && data.files.length > 0) {
            for (const file of data.files) {
                const ext = file.mimetype.split('/')[1] || 'bin';
                const fileName = `chat/${session._id}/${uuidv4()}.${ext}`;
                await uploadFile(file.buffer, fileName, file.mimetype);

                session.messages.push({
                    role: ChatRole.USER,
                    content: fileName, // Store the key/path
                    type: file.mimetype.startsWith('image/') ? 'image' : 'voice',
                    mimetype: file.mimetype,
                    createdAt: new Date(),
                });
            }
        }

        await session.save();

        return { result: await _formatChatSession(session), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Internal: append AI reply into session
// ---------------------------------------------------------------------------
export async function appendAssistantMessage(
    repairRequestId: string,
    content: string,
): AsyncSafeResult<ChatSessionResult> {
    try {
        const session = await ChatSessionModel.findOne({ repairRequestId });
        if (!session) throw ApiError.notFoundChatSession();

        session.messages.push({
            role: ChatRole.ASSISTANT,
            content,
            type: 'text',
            createdAt: new Date(),
        });

        await session.save();

        return { result: await _formatChatSession(session), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: finish chat — save AI report bullet points
// ---------------------------------------------------------------------------
export async function finishChatSession(
    customer: ICustomerDB,
    repairRequestId: string,
    aiReport: string[],
): AsyncSafeResult<ChatSessionResult> {
    try {
        const session = await ChatSessionModel.findOne({
            repairRequestId,
            customerId: customer._id,
        });
        if (!session) throw ApiError.notFoundChatSession();

        if (session.isFinished) return { result: await _formatChatSession(session), error: null };

        const req = await RepairRequestModel.findOne({ _id: repairRequestId });
        if (!req) throw ApiError.notFoundRepairRequest();

        session.aiReport = aiReport;
        session.isFinished = true;
        await session.save();

        req.status = RepairRequestStatus.PENDING_BRAND_SELECTION;
        req.aiReport = aiReport;
        await req.save();

        return { result: await _formatChatSession(session), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: get chat session for a repair request
// ---------------------------------------------------------------------------
export async function getChatSession(
    customer: ICustomerDB,
    repairRequestId: string,
): AsyncSafeResult<ChatSessionResult> {
    try {
        const session = await ChatSessionModel.findOne({
            repairRequestId,
            customerId: customer._id,
        }).sort('-createdAt');
        if (!session) throw ApiError.notFoundChatSession();

        return { result: await _formatChatSession(session), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export async function _formatChatSession(doc: IChatSessionDB): Promise<ChatSessionResult> {
    const messages = await Promise.all(doc.messages.map(async (msg) => {
        let content = msg.content;
        if (msg.type === 'image' || msg.type === 'voice') {
            content = await getFileUrl(msg.content);
        }
        return {
            role: msg.role,
            content,
            type: msg.type,
            mimetype: msg.mimetype,
            createdAt: converToTimeZone(msg.createdAt),
        };
    }));

    return {
        id: doc._id!.toString(),
        repairRequestId: doc.repairRequestId.toString(),
        customerId: doc.customerId.toString(),
        messages,
        isFinished: doc.isFinished,
        aiReport: doc.aiReport,
        createdAt: converToTimeZone(doc.createdAt),
        updatedAt: converToTimeZone(doc.updatedAt),
    };
}
