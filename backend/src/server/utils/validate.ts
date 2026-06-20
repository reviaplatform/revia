import { AdminRole } from '@/database/models/admin';
import { ProviderRole } from '@/database/models/provider';
import { getI18ValidationMessage } from '@server/utils/i18n';
import Joi from 'joi';
import { z } from 'zod';

export const nameValidationSchema = Joi.object({
  en: Joi.string()
    .trim()
    .min(1)
    .max(30)
    .required()
    .messages({
      'string.empty': getI18ValidationMessage('name.en.required'),
      'any.required': getI18ValidationMessage('name.en.required'),
      'string.min': getI18ValidationMessage('name.en.min'),
      'string.max': getI18ValidationMessage('name.en.max'),
    }),

  ar: Joi.string()
    .trim()
    .min(1)
    .max(30)
    .required()
    .messages({
      'string.empty': getI18ValidationMessage('name.ar.required'),
      'any.required': getI18ValidationMessage('name.ar.required'),
      'string.min': getI18ValidationMessage('name.ar.min'),
      'string.max': getI18ValidationMessage('name.ar.max'),
    }),
});

export const mongoDbIdValidationSchema = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': getI18ValidationMessage('id.invalid'),
    'string.empty': getI18ValidationMessage('id.required'),
    'any.required': getI18ValidationMessage('id.required'),
  });

export const locationValidationSchema = Joi.object({
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base': getI18ValidationMessage('location.longitude.invalid'),
      'number.min': getI18ValidationMessage('location.longitude.min'),
      'number.max': getI18ValidationMessage('location.longitude.max'),
      'any.required': getI18ValidationMessage('location.longitude.required'),
    }),

  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base': getI18ValidationMessage('location.latitude.invalid'),
      'number.min': getI18ValidationMessage('location.latitude.min'),
      'number.max': getI18ValidationMessage('location.latitude.max'),
      'any.required': getI18ValidationMessage('location.latitude.required'),
    }),
});

export const imageValidationSchema = Joi.binary()
  .min(1)
  .max(10 * 1024 * 1024) // Max size 10MB
  .messages({
    'binary.min': getI18ValidationMessage('image.minSize'),
    'binary.max': getI18ValidationMessage('image.maxSize'),
    'any.required': getI18ValidationMessage('image.required'),
  });

export const genderValidationSchema = Joi.string()
  .trim()
  .valid('male', 'female')
  .messages({
    'string.valid': getI18ValidationMessage('gender.invalid'),
    'any.required': getI18ValidationMessage('gender.required'),
  });

export const appBirthdayValidationSchema = Joi.string()
  .pattern(/^(0[1-9]|[12][0-9]|3[01]):(0[1-9]|1[0-2]):(\d{4})$/) // dd:mm:yyyy format
  .custom((value, helpers) => {
    const [day, month, year] = value.split(':').map(Number);
    const birthDate = new Date(year, month - 1, day); // JS months are 0-based
    const today = new Date();

    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // 120 years ago
    const maxDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate()); // 14 years ago

    if (birthDate < minDate || birthDate > maxDate) {
      return helpers.error('any.invalid', {
        custom: getI18ValidationMessage('appBirthday.invalid'),
      });
    }

    return value;
  })
  .messages({
    'string.pattern.base': getI18ValidationMessage('appBirthday.invalid'),
    'any.invalid': '{#custom}',
    'string.empty': getI18ValidationMessage('appBirthday.required'),
    'any.required': getI18ValidationMessage('appBirthday.required'),
  });

export const emailValidationSchema = Joi.string()
  .trim()
  .lowercase()
  .email()
  .messages({
    'string.email': getI18ValidationMessage('email.invalid'),
    'string.empty': getI18ValidationMessage('email.required'),
    'any.required': getI18ValidationMessage('email.required'),
  });

export const languagePreferenceValidationSchema = Joi.string()
  .trim()
  .valid('ar', 'en')
  .messages({
    'string.valid': getI18ValidationMessage('languagePreference.invalid'),
    'any.required': getI18ValidationMessage('languagePreference.required'),
  });

export const otpValidationSchema = Joi.string()
  .trim()
  .length(6)
  .messages({
    'string.length': getI18ValidationMessage('otp.length'),
    'string.empty': getI18ValidationMessage('otp.required'),
    'any.required': getI18ValidationMessage('otp.required'),
  });

export const strongPasswordValidationSchema = Joi.string()
  .trim()
  .min(8)
  .max(30)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,30}$/)
  .messages({
    'string.min': getI18ValidationMessage('password.minLength'),
    'string.max': getI18ValidationMessage('password.maxLength'),
    'string.pattern.base': getI18ValidationMessage('password.strong'),
    'string.empty': getI18ValidationMessage('password.required'),
    'any.required': getI18ValidationMessage('password.required'),
  });

export const passwordValidationSchema = Joi.string()
  .trim()
  .min(3)
  .max(30)
  .messages({
    'string.min': getI18ValidationMessage('password.minLength'),
    'string.max': getI18ValidationMessage('password.maxLength'),
    'string.empty': getI18ValidationMessage('password.required'),
    'any.required': getI18ValidationMessage('password.required'),
  });

export const adminRoleValidationSchema = Joi.string()
  .trim()
  .valid(AdminRole.ADMIN, AdminRole.MANAGER)
  .messages({
    'any.only': getI18ValidationMessage('adminRole.invalid'),
    'string.empty': getI18ValidationMessage('adminRole.required'),
    'any.required': getI18ValidationMessage('adminRole.required'),
  });

export const providerRoleValidationSchema = Joi.string()
  .trim()
  .valid(ProviderRole.OWNER)
  .messages({
    'any.only': getI18ValidationMessage('providerRole.invalid'),
    'string.empty': getI18ValidationMessage('providerRole.required'),
    'any.required': getI18ValidationMessage('providerRole.required'),
  });

export const fullNameSchemaValidationSchema = Joi.string()
  .trim()
  .min(1)
  .max(55)
  .messages({
    'string.empty': getI18ValidationMessage('fullName.required'),
    'any.required': getI18ValidationMessage('fullName.required'),
    'string.min': getI18ValidationMessage('fullName.min'),
    'string.max': getI18ValidationMessage('fullName.max'),
  });

export const phoneNumberValidationSchema = Joi.string()
  .trim()
  .min(11)
  .max(11)
  .messages({
    'string.min': getI18ValidationMessage('phoneNumber.min'),
    'string.max': getI18ValidationMessage('phoneNumber.max'),
    'string.empty': getI18ValidationMessage('phoneNumber.required'),
    'any.required': getI18ValidationMessage('phoneNumber.required'),
  });

const LangEnum = z.enum(['en', 'ar'], {
  errorMap: () => ({ message: 'Invalid language value. Allowed values are "en" or "ar".' }),
});

// Define ObjectId validation using regex
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

// Enum for roles, types, status, etc.
const RoleEnum = z.enum(
  ['owner', 'employee', 'contentManager', 'sales', 'admin', 'manager', 'superadmin', 'financial'],
  { errorMap: () => ({ message: 'Invalid role value.' }) },
);

const TypeEnum = z.enum(
  [
    'basic',
    'package',
    'photo',
    'video',
    'album',
    'photo-album',
    'mix',
    'card',
    'installment',
    'e-wallet',
    'contact-us',
    'delete-account',
    'admin',
    'provider',
    'customer',
  ],
  {
    errorMap: () => ({ message: 'Invalid type value.' }),
  },
);

const StatusEnum = z.enum(
  [
    'requested',
    'waiting for response',
    'signed',
    'not interested',
    'spam',
    'cancelled',
    'pending',
    'opened',
    'closed',
    'confirmed',
    'paid',
    'not paid',
    'refunded',
    'pending_refund',
    'refund_in_review',
    'PENDING',
    'PROGRESS',
    'REJECTED',
    'ACCEPTED',
    'active',
    'deleted',
    'banned',
  ],
  { errorMap: () => ({ message: 'Invalid status value.' }) },
);

export const querySchema = z.object({
  languagePreference: z
    .enum(['en', 'ar'], {
      errorMap: () => ({ message: 'Language preference must be either "en" or "ar".' }),
    })
    .optional(),
  lang: LangEnum.optional(),
  brandId: z.string().regex(mongoIdRegex, { message: 'Invalid brandId format.' }).optional(),
  addedBy: z.string().regex(mongoIdRegex, { message: 'Invalid addedBy format.' }).optional(),
  role: RoleEnum.optional(),
  profile: z.enum(['id'], { errorMap: () => ({ message: 'Invalid profile value.' }) }).optional(),
  mainCategory: z
    .string()
    .regex(mongoIdRegex, {
      message: 'Invalid mainCategory format.',
    })
    .optional(),
  data: z.enum(['id'], { errorMap: () => ({ message: 'Invalid data value.' }) }).optional(),
  day: z
    .string()
    .regex(/^\d{1,2}-\d{1,2}-\d{4}$/, { message: 'Day must be in the format dd-mm-yyyy.' })
    .optional(),
  lat: z
    .string()
    .transform(Number)
    .refine(val => val >= -90 && val <= 90, { message: 'Latitude must be between -90 and 90.' })
    .optional(),
  lng: z
    .string()
    .transform(Number)
    .refine(val => val >= -180 && val <= 180, {
      message: 'Longitude must be between -180 and 180.',
    })
    .optional(),
  type: TypeEnum.optional(),
  branchId: z.string().regex(mongoIdRegex, { message: 'Invalid branchId format.' }).optional(),
  userId: z.string().regex(mongoIdRegex, { message: 'Invalid userId format.' }).optional(),
  startTime: z
    .object({
      gt: z.string().transform(Number).optional(),
      lt: z.string().transform(Number).optional(),
      gte: z.string().transform(Number).optional(),
      lte: z.string().transform(Number).optional(),
    })
    .optional(),
  status: StatusEnum.optional(),
  startDate: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true;

        // Accept multiple date formats:
        // 1. Simple date: YYYY-MM-DD
        // 2. ISO date: YYYY-MM-DDTHH:mm:ss.sssZ
        // 3. Date with timezone: YYYY-MM-DDTHH:mm:ss+02:00

        // Check if it's a simple date format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          const [year, month, day] = val.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return !isNaN(date.getTime()) && date.getFullYear() === year;
        }

        // Check if it's a valid date string
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Start date must be a valid date string (YYYY-MM-DD or ISO format).' },
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true;

        // Accept multiple date formats:
        // 1. Simple date: YYYY-MM-DD
        // 2. ISO date: YYYY-MM-DDTHH:mm:ss.sssZ
        // 3. Date with timezone: YYYY-MM-DDTHH:mm:ss+02:00

        // Check if it's a simple date format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          const [year, month, day] = val.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return !isNaN(date.getTime()) && date.getFullYear() === year;
        }

        // Check if it's a valid date string
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'End date must be a valid date string (YYYY-MM-DD or ISO format).' },
    ),
  page: z
    .union([
      z
        .string()
        .regex(/^\d+$/, { message: 'Page must be a valid positive number.' })
        .transform(Number)
        .refine(val => val >= 1, { message: 'Page must be 1 or greater.' }),
      z.enum(['undefined'], { errorMap: () => ({ message: 'Page must be 1 or greater.' }) }),
    ])
    .optional(),
  limit: z
    .union([
      z
        .string()
        .regex(/^\d+$/, { message: 'Limit must be a valid number.' })
        .transform(Number)
        .refine(val => val >= 1 && val <= 250, { message: 'Limit must be between 1 and 250.' }),
      z.enum(['undefined'], { errorMap: () => ({ message: 'Limit must be between 1 and 250.' }) }),
    ])
    .optional(),
  keyword: z
    .string()
    .max(100, { message: 'Keyword must be no longer than 100 characters.' })
    .optional(),
  sort: z.string().max(20, { message: 'Sort must be no longer than 20 characters.' }).optional(),
  withoutBrandData: z.string().optional(),
  opened: z
    .union([
      z.boolean(),
      z.string().transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
    ])
    .optional(),
  birthdayMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, { message: 'Birthday month must be between 01 and 12.' })
    .optional(),
  birthdayDay: z
    .string()
    .regex(/^(0[1-9]|[12][0-9]|3[01])$/, { message: 'Birthday day must be between 01 and 31.' })
    .optional(),
});
