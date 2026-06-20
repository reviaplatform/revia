import { Router } from 'express';
import * as ctrl from './subscription.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerIsBanned } from '@server/middleware/isBanned';
import { providerBrandIsBanned } from '@server/middleware/isBanned';

const router = Router();

// GET /api/v1/provider/subscription/pricing
router.get('/pricing',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  ctrl.getPricing,
);

// POST /api/v1/provider/subscription
router.post('/',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  ctrl.createSubscription,
);

// GET /api/v1/provider/subscription
router.get('/',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  ctrl.getSubscription,
);

export default router;
