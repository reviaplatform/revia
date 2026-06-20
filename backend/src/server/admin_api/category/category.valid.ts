import { nameValidationSchema } from '@server/utils/validate';
import Joi from 'joi';

export const createCategoryDataSchema = Joi.object({
  name: nameValidationSchema.required(),
  commissionPerRequest: Joi.number().min(0).max(100).required(),
});

export const updateCategoryDataSchema = Joi.object({
  name: nameValidationSchema,
  commissionPerRequest: Joi.number().min(0).max(100),
  isActive: Joi.boolean(),
});
