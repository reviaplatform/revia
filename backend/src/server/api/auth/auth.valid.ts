import {
  appBirthdayValidationSchema,
  emailValidationSchema,
  fullNameSchemaValidationSchema,
  genderValidationSchema,
  languagePreferenceValidationSchema,
  otpValidationSchema,
  phoneNumberValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const userAuthSignupSchema = Joi.object({
  name: fullNameSchemaValidationSchema.required(),
  gender: genderValidationSchema.required(),
  email: emailValidationSchema,
  birthday: appBirthdayValidationSchema,
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const sendOTPSchema = Joi.object({
  phoneNumber: phoneNumberValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const validateOTPSchemae = Joi.object({
  phoneNumber: phoneNumberValidationSchema.required(),
  otp: otpValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const validateOTPSchemane = Joi.object({
  phoneNumber: phoneNumberValidationSchema.required(),
  otp: otpValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});
