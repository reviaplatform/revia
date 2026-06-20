import {
  emailValidationSchema,
  languagePreferenceValidationSchema,
  otpValidationSchema,
  passwordValidationSchema,
  strongPasswordValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  email: emailValidationSchema.required(),
  password: passwordValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const forgotPasswordSchema = Joi.object({
  email: emailValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const verifyOTPSchema = Joi.object({
  email: emailValidationSchema.required(),
  otp: otpValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const resetPasswordSchema = Joi.object({
  email: emailValidationSchema.required(),
  newPassword: strongPasswordValidationSchema.required(),
  otp: otpValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});
