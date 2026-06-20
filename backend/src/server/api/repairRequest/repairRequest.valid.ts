import Joi from 'joi';
import { RepairRequestFlow } from '@/database/models/repairRequest';
import { mongoDbIdValidationSchema } from '@server/utils/validate';

const flowValues = Object.values(RepairRequestFlow);

// POST /api/v1/repair-requests
export const createRepairRequestSchema = Joi.object({
    deviceId: mongoDbIdValidationSchema.required(),
    issueText: Joi.string().trim().min(5).max(1000).required().messages({
        'string.min': 'Issue description must be at least 5 characters',
        'string.max': 'Issue description must not exceed 1000 characters',
        'any.required': 'Issue description is required',
    }),
    flow: Joi.string()
        .valid(...flowValues)
        .required()
        .messages({
            'any.only': `Flow must be one of: ${flowValues.join(', ')}`,
            'any.required': 'Flow is required',
        }),
    processedFiles: Joi.array().items(Joi.any()).optional(),
});

// POST /api/v1/repair-requests/:requestId/chat/messages
export const sendMessageSchema = Joi.object({
    content: Joi.string().trim().min(0).allow('').max(2000).optional().messages({
        'string.max': 'Message must not exceed 2000 characters',
    }),
    type: Joi.string().valid('text', 'image', 'voice', 'system').optional().default('text'),
    processedFiles: Joi.array().items(Joi.any()).optional(),
});

// POST /api/v1/repair-requests/:requestId/chat/finish
export const finishChatSchema = Joi.object({
    closeRequest: Joi.boolean().required().messages({
        'any.required': 'closeRequest is required',
    }),
});

// POST /api/v1/repair-requests/:requestId/select-offer
export const selectOfferSchema = Joi.object({
    offerId: mongoDbIdValidationSchema.required(),
});

// POST /api/v1/repair-requests/:requestId/review
export const reviewRequestSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
        'number.min': 'Rating must be between 1 and 5',
        'number.max': 'Rating must be between 1 and 5',
        'any.required': 'Rating is required',
    }),
    comment: Joi.string().trim().max(1000).optional().messages({
        'string.max': 'Comment must not exceed 1000 characters',
    }),
});
