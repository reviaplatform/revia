import { locationValidationSchema, nameValidationSchema } from '@server/utils/validate';
import Joi from 'joi';

export const createBranchDataSchema = Joi.object({
  name: nameValidationSchema.required(),
  location: locationValidationSchema.required(),
  isActive: Joi.boolean().required(),
});

export const updateBranchDataSchema = Joi.object({
  name: nameValidationSchema,
  location: locationValidationSchema,
  isActive: Joi.boolean(),
});
