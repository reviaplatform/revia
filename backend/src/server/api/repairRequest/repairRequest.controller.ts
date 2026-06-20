import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import axios from 'axios';
import { ApiError, HttpStatus } from '@/core/errors';
import { CustomCustomerRequest } from '@server/middleware/isAuth';
import { PaymentMethod } from '@/database/models/payment';
import {
    createRepairRequest,
    getCustomerRepairRequests,
    getRepairRequest,
    cancelRepairRequest,
    selectBrandOffer,
    assignBrandsToRequest,
} from '@/core/repairRequest';
import {
    startChatSession,
    sendMessage,
    getChatSession,
    finishChatSession,
} from '@/core/chatSession';
import { getOffersForRequest } from '@/core/brandOffer';
import { getInspectionByRequest } from '@/core/inspection';
import { payInspectionFee, payFinalPrice } from '@/core/payment';
import { createBrandReview } from '@/core/brandReview';
import { simulateAiReply } from './repairRequest.socket';
import { chatWithAssistant } from '@/core/chatSession/gemini';
import ChatSessionModel from '@/database/models/chatSession';
import RepairRequestModel from '@/database/models/repairRequest';
import DeviceModel from '@/database/models/device';
import BrandOfferModel from '@/database/models/brandOffer';

// ---------------------------------------------------------------------------
// 1. POST /api/v1/repair-requests
// ---------------------------------------------------------------------------
/**
 * Create a new repair request (Flow 1 or Flow 2).
 * Flow 2 automatically starts a chat session after creation.
 */
export async function create(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await createRepairRequest(req.user!, req.body);
        const result = unwrapResult(response);

        if (req.body.flow === 'ai_chat') {
            await startChatSession(req.user!, result.id);

            const msg = await sendMessage(req.user!, result.id, {
                content: req.body.issueText,
                files: req.body.processedFiles,
            });
            const msgResult = unwrapResult(msg);

            simulateAiReply(req.app.get('io'), result.id, req.user!._id!.toString()).catch(() => { });

            return res.JSON(HttpStatus.Created, { ...result, chat: msgResult });
        }

        // Flow 1 (Direct) — request is already forwarded to brands in core logic
        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 2. POST /api/v1/repair-requests/:requestId/chat/messages
// ---------------------------------------------------------------------------
export async function sendChatMessage(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await sendMessage(req.user!, req.params.requestId as string, {
            ...req.body,
            files: req.body.processedFiles,
        });
        const result = unwrapResult(response);

        simulateAiReply(req.app.get('io'), req.params.requestId as string, req.user!._id!.toString()).catch(() => { });

        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 3. GET /api/v1/repair-requests/:requestId/chat
// ---------------------------------------------------------------------------
/**
 * Get the chat session (messages + AI report) for a Flow 2 repair request.
 */
export async function getChatMessages(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getChatSession(req.user!, req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

async function generateFinalAiReport(req: CustomCustomerRequest, requestId: string, isClosing: boolean): Promise<string[]> {
    const session = await ChatSessionModel.findOne({ repairRequestId: requestId, customerId: req.user!._id });
    if (!session) throw ApiError.notFoundChatSession();

    const request = await RepairRequestModel.findById(requestId);
    if (!request) throw ApiError.notFoundRepairRequest();

    const device = await DeviceModel.findById(request.deviceId);

    const { result: formattedSession } = await getChatSession(req.user!, requestId);
    if (!formattedSession) throw ApiError.notFoundChatSession();

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
                console.error(`Failed to fetch attachment for Gemini: ${m.content}`, err);
                parts.push({ text: `[${m.type} attachment]` });
            }
        }

        return { role, parts };
    }));

    const actionText = isClosing ? "I want to close and cancel this repair request." : "I want to stop the chat and proceed to get offers from brands.";
    messages.push({
        role: 'user',
        parts: [{ text: `${actionText} Please generate the final diagnostic_report JSON immediately based on the information we have gathered so far.` }]
    });

    try {
        const response = await chatWithAssistant(messages, req.user!, device);
        const aiContent = response.text || '';

        const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            const parsedJson = JSON.parse(jsonMatch[1]);
            if (parsedJson.diagnostic_report) {
                return parsedJson.diagnostic_report;
            }
        }

        // If the AI didn't output valid JSON but gave a text response, include it.
        return [aiContent.replace(/```(json)?/g, '').trim()];
    } catch (err) {
        console.error("Failed to generate forced AI report:", err);
    }

    return isClosing ? [
        'Customer opted to close the repair request manually.',
    ] : [
        'Customer opted to proceed with brand offers before completing full AI troubleshooting.',
    ];
}

// ---------------------------------------------------------------------------
// 4. POST /api/v1/repair-requests/:requestId/chat/finish  (closeRequest: true)
// ---------------------------------------------------------------------------
/**
 * Finish the AI chat AND close the repair request (status → closed).
 */
async function finishChatAndClose(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const aiReport = await generateFinalAiReport(req, req.params.requestId as string, true);

        const response = await finishChatSession(req.user!, req.params.requestId as string, aiReport);
        unwrapResult(response);

        // Also cancel the repair request
        const cancelRes = await cancelRepairRequest(req.user!, req.params.requestId as string);
        unwrapResult(cancelRes);

        res.JSON(HttpStatus.Ok, { message: 'Chat finished and repair request closed.', aiReport });
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 5. POST /api/v1/repair-requests/:requestId/chat/finish  (closeRequest: false)
// ---------------------------------------------------------------------------
/**
 * Finish the AI chat WITHOUT closing the request.
 * Saves AI report as bullet points and forwards request to brands.
 */
async function finishChatAndForward(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const aiReport = await generateFinalAiReport(req, req.params.requestId as string, false);

        const response = await finishChatSession(req.user!, req.params.requestId as string, aiReport);
        const result = unwrapResult(response);

        // Forward to brands
        const assignRes = await assignBrandsToRequest(req.params.requestId as string);
        unwrapResult(assignRes);

        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// Shared finish endpoint — delegates based on body.closeRequest
// ---------------------------------------------------------------------------
export async function finishChatHandler(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    if (req.body.closeRequest === true) {
        return finishChatAndClose(req, res, next);
    }

    return finishChatAndForward(req, res, next);
}

// ---------------------------------------------------------------------------
// 6. GET /api/v1/repair-requests/:requestId/offers
// ---------------------------------------------------------------------------
/**
 * Get all brand offers for a specific repair request.
 */
export async function listOffers(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getOffersForRequest(req.params.requestId as string, req.lang as 'en' | 'ar');
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 7. POST /api/v1/repair-requests/:requestId/select-offer
// ---------------------------------------------------------------------------
/**
 * Customer selects a brand offer. Validates the offer belongs to this request.
 */
export async function chooseOffer(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await selectBrandOffer(req.user!, req.params.requestId as string, req.body.offerId);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 8. POST /api/v1/repair-requests/:requestId/pay-inspection
// ---------------------------------------------------------------------------
/**
 * Customer pays the inspection fee — request advances to inspection_pending.
 */
export async function payInspection(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await payInspectionFee(
            req.user!,
            req.params.requestId as string,
            PaymentMethod.ONLINE,
        );
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 9. GET /api/v1/repair-requests/:requestId/inspection
// ---------------------------------------------------------------------------
/**
 * Customer gets the inspection result created by the brand.
 */
export async function getInspection(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getInspectionByRequest(req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 10. POST /api/v1/repair-requests/:requestId/pay-final
// ---------------------------------------------------------------------------
/**
 * Customer pays the final repair price — request advances to completed.
 */
export async function payFinal(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await payFinalPrice(
            req.user!,
            req.params.requestId as string,
            PaymentMethod.ONLINE,
        );
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 11. DELETE /api/v1/repair-requests/:requestId
// ---------------------------------------------------------------------------
/**
 * Customer cancels a repair request.
 */
export async function cancel(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await cancelRepairRequest(req.user!, req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 12. GET /api/v1/repair-requests
// ---------------------------------------------------------------------------
/**
 * Get all repair requests for the authenticated customer.
 */
export async function listMyRequests(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getCustomerRepairRequests(req.user!);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// GET /api/v1/repair-requests/:requestId
// ---------------------------------------------------------------------------
/**
 * Get a single repair request by ID.
 */
export async function getOne(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getRepairRequest(req.user!, req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 13. POST /api/v1/repair-requests/:requestId/review
// ---------------------------------------------------------------------------
/**
 * Customer reviews the brand after repair is completed.
 */
export async function createReview(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await createBrandReview(req.user!, req.params.requestId as string, req.body);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// GET /api/v1/repair-requests/:requestId/remaining-offers
// ---------------------------------------------------------------------------
export async function getRemainingOffersStatus(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const requestId = req.params.requestId;
        const request = await RepairRequestModel.findById(requestId);
        if (!request) throw ApiError.notFoundRepairRequest();

        const offersCount = await BrandOfferModel.countDocuments({ repairRequestId: requestId });
        const remainingCount = Math.max(0, request.assignedBrandIds.length - offersCount);

        res.JSON(HttpStatus.Ok, {
            requestId,
            assignedBrandsCount: request.assignedBrandIds.length,
            offersCount,
            remainingCount,
        });
    } catch (err) {
        next(err);
    }
}
