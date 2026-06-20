import { imageValidationSchema, nameValidationSchema } from '@server/utils/validate';
import Joi from 'joi';

export const updateBrandDataSchema = Joi.object({
  logo: imageValidationSchema,
  name: nameValidationSchema,
  allowPayUsePOS: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
});
