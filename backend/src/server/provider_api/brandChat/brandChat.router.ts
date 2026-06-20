import { Router } from 'express';
import * as ctrl from './brandChat.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerIsBanned, providerBrandIsBanned } from '@server/middleware/isBanned';
import { uploadSingleData } from '@server/middleware/multer';

const router = Router();

// GET /api/v1/provider/brand-chat
router.get('/',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  ctrl.getSession,
);

// POST /api/v1/provider/brand-chat/new
router.post('/new',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  ctrl.startNewSession,
);

// POST /api/v1/provider/brand-chat/message
router.post('/message',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  uploadSingleData('file'),
  ctrl.sendMessage,
);

export default router;
