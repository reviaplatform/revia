import { Router } from 'express';
import * as userController from './user.controller';
import { uploadSingleData } from '@server/middleware/multer';
import { uploadUserProfileImage } from '@server/middleware/imageProcessing';
import { isAuth } from '@server/middleware/isAuth';
import { userIsBanned } from '@server/middleware/isBanned';
import { querySchema } from '@server/utils/validate';
import { editUserSchema } from './user.valid';
import { changeLanguage } from '@server/middleware/language';
import { validateBody, validateQuery } from '@server/middleware/validate';

const router = Router();

// /api/v1/me
router.get(
  '/me',
  isAuth,
  userIsBanned,
  changeLanguage,
  validateQuery(querySchema),
  userController.getMe,
);

// /api/v1/me
router.put(
  '/me',
  isAuth,
  userIsBanned,
  changeLanguage,
  uploadSingleData('picture'),
  uploadUserProfileImage,
  validateBody(editUserSchema),
  userController.editMe,
);

// /api/v1/me
router.delete('/me', isAuth, userIsBanned, changeLanguage, userController.deleteMe);

export default router;
