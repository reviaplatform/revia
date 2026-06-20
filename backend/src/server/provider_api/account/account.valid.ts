import {
  emailValidationSchema,
  fullNameSchemaValidationSchema,
  languagePreferenceValidationSchema,
  phoneNumberValidationSchema,
  providerRoleValidationSchema,
  strongPasswordValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const createProviderDataSchema = Joi.object({
  name: fullNameSchemaValidationSchema.required(),
  email: emailValidationSchema.required(),
  phoneNumber: phoneNumberValidationSchema.required(),
  role: providerRoleValidationSchema.required(),
  password: strongPasswordValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const updateProviderDataSchema = Joi.object({
  role: providerRoleValidationSchema.required(),
});
