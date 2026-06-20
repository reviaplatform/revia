import {
  emailValidationSchema,
  fullNameSchemaValidationSchema,
  languagePreferenceValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const editProviderSchema = Joi.object({
  name: fullNameSchemaValidationSchema,
  languagePreference: languagePreferenceValidationSchema,
  email: emailValidationSchema,
});
