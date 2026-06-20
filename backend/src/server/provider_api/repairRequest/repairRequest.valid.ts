import { PaymentMethod } from '@/database/models/payment';
import Joi from 'joi';

const offerItemSchema = Joi.object({
    expectedIssue: Joi.string().trim().min(2).max(500).required(),
    priceRange: Joi.object({
        min: Joi.number().min(0).required(),
        max: Joi.number().min(Joi.ref('min')).required(),
    }).required(),
    expectedFinishDate: Joi.string().isoDate().required().messages({
        'string.isoDate': 'expectedFinishDate must be a valid ISO date string',
    }),
});

// POST /api/v1/provider/repair-requests/:requestId/offer
export const sendOfferSchema = Joi.object({
    branchIndex: Joi.number().integer().min(0).required(),
    offerItems: Joi.array().items(offerItemSchema).min(1).required().messages({
        'array.min': 'At least one offer item is required',
    }),
    distanceKm: Joi.number().min(0).required(),
    inspectionPrice: Joi.number().min(0).required(),
});

// POST /api/v1/provider/repair-requests/:requestId/inspection
export const sendInspectionSchema = Joi.object({
    resultNotes: Joi.string().trim().min(5).max(2000).required(),
    finalPrice: Joi.number().min(0).required(),
    images: Joi.array().items(Joi.string().uri()).default([]),
});


export const payPaymentSchema = Joi.object({
    paymentMethod: Joi.string()
        .valid(PaymentMethod.CASH, PaymentMethod.POS)
        .required()
        .messages({
            'any.only': `Payment method must be one of: ${[PaymentMethod.CASH, PaymentMethod.POS].join(', ')}`,
            'any.required': 'Payment method is required',
        }),
});