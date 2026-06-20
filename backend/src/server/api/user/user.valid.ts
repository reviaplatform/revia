import {
  appBirthdayValidationSchema,
  emailValidationSchema,
  fullNameSchemaValidationSchema,
  genderValidationSchema,
  imageValidationSchema,
  languagePreferenceValidationSchema,
  locationValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const editUserSchema = Joi.object({
  name: fullNameSchemaValidationSchema,
  languagePreference: languagePreferenceValidationSchema,
  picture: imageValidationSchema,
  email: emailValidationSchema,
  gender: genderValidationSchema,
  location: locationValidationSchema,
  birthday: appBirthdayValidationSchema,
});