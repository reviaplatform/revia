import { Router } from 'express';
import * as brandController from './brand.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { querySchema } from '@server/utils/validate';
import { validateBody, validateQuery } from '@server/middleware/validate';
import { updateBrandDataSchema } from './brand.valid';
import { uploadSingleData } from '@server/middleware/multer';
import { resizeBrandLogo } from '@server/middleware/imageProcessing';

const router = Router();

// /api/v1/provider/brand/update
router.put(
  '/update',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  uploadSingleData('logo'),
  resizeBrandLogo,
  validateBody(updateBrandDataSchema),
  brandController.updateBrandData,
);

// /api/v1/provider/brand/reviews
router.get(
  '/reviews',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  brandController.getOwnReviews,
);

// /api/v1/provider/brand/
router.get(
  '/',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateQuery(querySchema),
  brandController.getBrand,
);

export default router;
