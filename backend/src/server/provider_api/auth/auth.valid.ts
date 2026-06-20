import {
  emailValidationSchema,
  fullNameSchemaValidationSchema,
  imageValidationSchema,
  languagePreferenceValidationSchema,
  locationValidationSchema,
  mongoDbIdValidationSchema,
  nameValidationSchema,
  otpValidationSchema,
  passwordValidationSchema,
  phoneNumberValidationSchema,
  strongPasswordValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const providerLoginSchema = Joi.object({
  phoneNumber: phoneNumberValidationSchema.required(),
  password: passwordValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const providerSignupSchema = Joi.object({
  languagePreference: languagePreferenceValidationSchema.required(),
  providerData: Joi.object({
    name: fullNameSchemaValidationSchema.required(),
    email: emailValidationSchema.required(),
    phoneNumber: phoneNumberValidationSchema.required(),
    password: strongPasswordValidationSchema.required(),
  }),
  brandData: Joi.object({
    logo: imageValidationSchema.required(),
    name: nameValidationSchema.required(),
    crn: Joi.string().min(1).max(100).required(),
    tin: Joi.string().min(1).max(100).required(),
    categories: Joi.array().items(mongoDbIdValidationSchema).min(1).max(50).required(),
    branches: Joi.array()
      .items(
        Joi.object({
          name: nameValidationSchema.required(),
          location: locationValidationSchema.required(),
        }),
      )
      .min(1)
      .max(50)
      .required(),
    allowPayUsePOS: Joi.boolean().required(),
  }),
});

export const forgotPasswordSchema = Joi.object({
  phoneNumber: phoneNumberValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const verifyOTPSchema = Joi.object({
  phoneNumber: phoneNumberValidationSchema.required(),
  otp: otpValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});

export const resetPasswordSchema = Joi.object({
  phoneNumber: phoneNumberValidationSchema.required(),
  newPassword: strongPasswordValidationSchema.required(),
  otp: otpValidationSchema.required(),
  languagePreference: languagePreferenceValidationSchema.required(),
});
