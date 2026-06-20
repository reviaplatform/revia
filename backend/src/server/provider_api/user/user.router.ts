import { Router } from 'express';
import * as userController from './user.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { querySchema } from '@server/utils/validate';
import { changeLanguage } from '@server/middleware/language';
import { validateBody, validateQuery } from '@server/middleware/validate';
import { editProviderSchema } from './user.valid';

const router = Router();

// /api/v1/provider/me
router.get(
  '/me',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateQuery(querySchema),
  userController.getMe,
);

// /api/v1/provider/me
router.put(
  '/me',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateBody(editProviderSchema),
  userController.editMe,
);

export default router;
