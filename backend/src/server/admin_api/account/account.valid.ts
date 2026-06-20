import {
  adminRoleValidationSchema,
  emailValidationSchema,
  fullNameSchemaValidationSchema,
  phoneNumberValidationSchema,
} from '@server/utils/validate';
import Joi from 'joi';

export const createAdminDataSchema = Joi.object({
  name: fullNameSchemaValidationSchema.required(),
  email: emailValidationSchema.required(),
  phoneNumber: phoneNumberValidationSchema.required(),
  role: adminRoleValidationSchema.required(),
});

export const updateAdminDataSchema = Joi.object({
  role: adminRoleValidationSchema.required(),
});
