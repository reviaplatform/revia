import Joi from 'joi';
import { PayoutMethod } from '@/database/models/brandPayout';

const instapayDestinationSchema = Joi.object({
    identifier: Joi.string().trim().min(3).max(100).required(),
    accountHolderName: Joi.string().trim().min(2).max(100).required(),
});

const bankDestinationSchema = Joi.object({
    bankName: Joi.string().trim().min(2).max(100).required(),
    accountHolderName: Joi.string().trim().min(2).max(100).required(),
    iban: Joi.string().trim().uppercase().pattern(/^EG\d{25}$/).required().messages({
        'string.pattern.base': 'IBAN must be a valid Egyptian IBAN (EG + 25 digits)',
    }),
    accountNumber: Joi.string().trim().max(30).optional().allow(null),
    swiftCode: Joi.string().trim().uppercase().max(11).optional().allow(null),
});

const walletDestinationSchema = Joi.object({
    walletProvider: Joi.string().trim().lowercase().min(2).max(50).required(),
    phoneNumber: Joi.string().trim().min(11).max(11).required(),
    accountHolderName: Joi.string().trim().min(2).max(100).required(),
});

// POST /api/v1/provider/payouts
export const createPayoutSchema = Joi.object({
    amount: Joi.number().min(50).required().messages({
        'number.min': 'Minimum payout amount is 50 EGP',
    }),
    method: Joi.string()
        .trim()
        .valid(...Object.values(PayoutMethod))
        .required()
        .messages({
            'any.only': `Method must be one of: ${Object.values(PayoutMethod).join(', ')}`,
        }),
    instapayDestination: instapayDestinationSchema.when('method', {
        is: PayoutMethod.INSTAPAY,
        then: Joi.required(),
        otherwise: Joi.optional().allow(null),
    }),
    bankDestination: bankDestinationSchema.when('method', {
        is: PayoutMethod.BANK,
        then: Joi.required(),
        otherwise: Joi.optional().allow(null),
    }),
    walletDestination: walletDestinationSchema.when('method', {
        is: PayoutMethod.WALLET,
        then: Joi.required(),
        otherwise: Joi.optional().allow(null),
    }),
});
