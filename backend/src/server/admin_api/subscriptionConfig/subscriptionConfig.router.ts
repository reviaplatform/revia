import { Router } from 'express';
import * as ctrl from './subscriptionConfig.controller';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { adminIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { AdminRole } from '@/database/models/admin';

const router = Router();

// GET /api/v1/admin/subscription-config
router.get('/',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  ctrl.getConfig,
);

// PATCH /api/v1/admin/subscription-config
router.patch('/',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  ctrl.updateConfig,
);

export default router;
