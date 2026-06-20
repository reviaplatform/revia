import { Router } from 'express';
import * as reelController from './reel.controller';
import { isAuth, optionalAuth } from '@server/middleware/isAuth';
import { changeLanguage } from '@server/middleware/language';
import { validateQuery } from '@server/middleware/validate';
import { reelQuerySchema } from './reel.valid';
import { userIsBanned } from '@server/middleware/isBanned';

const router = Router();

// /api/v1/user/reel/
router.get(
  '/',
  optionalAuth,
  changeLanguage,
  validateQuery(reelQuerySchema),
  reelController.getReels,
);

router.post(
  '/:id/like',
  isAuth,
  userIsBanned,
  changeLanguage,
  reelController.likeReel,
);

router.post(
  '/:id/unlike',
  isAuth,
  userIsBanned,
  changeLanguage,
  reelController.unlikeReel,
);

router.post(
  '/:id/view',
  changeLanguage,
  reelController.viewReel,
);

export default router;
