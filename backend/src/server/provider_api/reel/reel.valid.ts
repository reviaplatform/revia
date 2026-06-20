import Joi from 'joi';

export const createReelSchema = Joi.object({
  caption: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required(),
  }).required(),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).default([]),
  videoBuffer: Joi.any().required(),
  videoMimetype: Joi.string().required(),
  thumbnailBuffer: Joi.any().required(),
});

export const updateReelSchema = Joi.object({
  caption: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required(),
  }),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
  isVisible: Joi.boolean(),
});
