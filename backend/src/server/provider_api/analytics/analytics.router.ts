import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { validateQuery } from '@server/middleware/validate';
import { analyticsQuerySchema } from './analytics.valid';

const router = Router();

// GET /api/v1/provider/analytics
router.get(
    '/',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    changeLanguage,
    validateQuery(analyticsQuerySchema),
    analyticsController.getAnalytics,
);

export default router;
