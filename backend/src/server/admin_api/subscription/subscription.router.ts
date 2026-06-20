import { Router } from 'express';
import * as ctrl from './subscription.controller';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { adminIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { AdminRole } from '@/database/models/admin';

const router = Router();

// GET /api/v1/admin/subscriptions
router.get('/',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  ctrl.listSubscriptions,
);

// PATCH /api/v1/admin/subscriptions/:id/mark-paid
router.patch('/:id/mark-paid',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  ctrl.markAsPaid,
);

export default router;
