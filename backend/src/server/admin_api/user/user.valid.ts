import {
  fullNameSchemaValidationSchema,
  languagePreferenceValidationSchema,
  passwordValidationSchema,
  strongPasswordValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const updateAdminDataSchema = Joi.object({
  name: fullNameSchemaValidationSchema,
  languagePreference: languagePreferenceValidationSchema,
});

export const updateAdminPasswordDataSchema = Joi.object({
  oldPassword: passwordValidationSchema.required(),
  newPassword: strongPasswordValidationSchema.required(),
  confNewPassword: strongPasswordValidationSchema.required(),
});
