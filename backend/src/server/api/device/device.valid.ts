import Joi from 'joi';
import { DevicePlatform } from '@/database/models/device';
import { mongoDbIdValidationSchema } from '@server/utils/validate';

const devicePlatformValues = Object.values(DevicePlatform);

// POST /api/v1/devices  – register a new device
export const registerDeviceSchema = Joi.object({
    categoryId: mongoDbIdValidationSchema.required(),
    name: Joi.string().trim().min(1).max(100).required().messages({
        'string.base': 'Device name must be a string',
        'string.min': 'Device name must have at least 1 character',
        'string.max': 'Device name must not exceed 100 characters',
        'any.required': 'Device name is required',
    }),
    manufacturer: Joi.string().trim().min(1).max(100).required().messages({
        'string.base': 'Device manufacturer must be a string',
        'string.min': 'Device manufacturer must have at least 1 character',
        'string.max': 'Device manufacturer must not exceed 100 characters',
        'any.required': 'Device manufacturer is required',
    }),
    platform: Joi.string()
        .valid(...devicePlatformValues)
        .required()
        .messages({
            'any.only': `Platform must be one of: ${devicePlatformValues.join(', ')}`,
            'any.required': 'Platform is required',
        }),
    deviceModel: Joi.string().trim().max(150).required().messages({
        'string.max': 'Device model must not exceed 150 characters',
        'any.required': 'Device model is required',
    }),
    osVersion: Joi.string().trim().max(50).optional().messages({
        'string.max': 'OS version must not exceed 50 characters',
    }).allow(''),
});

// PUT /api/v1/devices/:id  – update an existing device
export const updateDeviceSchema = Joi.object({
    categoryId: mongoDbIdValidationSchema.optional(),
    name: Joi.string().trim().min(1).max(100).optional().messages({
        'string.base': 'Device name must be a string',
        'string.min': 'Device name must have at least 1 character',
        'string.max': 'Device name must not exceed 100 characters',
    }),
    manufacturer: Joi.string().trim().min(1).max(100).optional().messages({
        'string.base': 'Device manufacturer must be a string',
        'string.min': 'Device manufacturer must have at least 1 character',
        'string.max': 'Device manufacturer must not exceed 100 characters',
    }),
    platform: Joi.string()
        .valid(...devicePlatformValues)
        .optional()
        .messages({
            'any.only': `Platform must be one of: ${devicePlatformValues.join(', ')}`,
        }),
    deviceModel: Joi.string().trim().max(150).optional().messages({
        'string.max': 'Device model must not exceed 150 characters',
    }),
    osVersion: Joi.string().trim().max(50).optional().messages({
        'string.max': 'OS version must not exceed 50 characters',
    }).allow(''),
});
