import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { adminIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { AdminRole } from '@/database/models/admin';
import { validateQuery } from '@server/middleware/validate';
import { analyticsQuerySchema } from './analytics.valid';

const router = Router();

// GET /api/v1/admin/analytics
router.get(
    '/',
    adminIsAuth,
    adminIsBanned,
    changeLanguage,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    validateQuery(analyticsQuerySchema),
    analyticsController.getAnalytics,
);

export default router;
