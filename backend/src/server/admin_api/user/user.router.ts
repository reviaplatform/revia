import { Router } from 'express';
import * as userController from './user.controller';
import { adminIsBanned } from '@server/middleware/isBanned';
import { adminIsAuth } from '@server/middleware/isAuth';
import { querySchema } from '@server/utils/validate';
import { updateAdminDataSchema, updateAdminPasswordDataSchema } from './user.valid';
import { changeLanguage } from '@server/middleware/language';
import { validateBody, validateQuery } from '@server/middleware/validate';

const router = Router();

// /api/v1/admin/
router.get(
  '/me',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  validateQuery(querySchema),
  userController.getMe,
);

// /api/v1/admin/
router.put(
  '/me',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  validateBody(updateAdminDataSchema),
  userController.updateMe,
);

// /api/v1/admin/password
router.put(
  '/me/password',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  validateBody(updateAdminPasswordDataSchema),
  userController.updateMePassword,
);

export default router;
