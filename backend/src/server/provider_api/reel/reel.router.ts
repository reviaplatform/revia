import { Router } from 'express';
import * as reelController from './reel.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { validateBody } from '@server/middleware/validate';
import { createReelSchema, updateReelSchema } from './reel.valid';
import { uploadMultiData } from '@server/middleware/multer';
import { uploadReelFiles } from '@server/middleware/imageProcessing';

const router = Router();

// /api/v1/provider/reel/
router.get(
  '/',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  reelController.getMyReels,
);

router.post(
  '/',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  uploadMultiData([
    { name: 'video', maxCount: 1 },
  ]),
  uploadReelFiles,
  validateBody(createReelSchema),
  reelController.createReel,
);

router.patch(
  '/:id',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateBody(updateReelSchema),
  reelController.updateReel,
);

router.delete(
  '/:id',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  reelController.deleteReel,
);

export default router;
