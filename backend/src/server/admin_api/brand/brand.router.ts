import { Router } from 'express';
import * as brandController from './brand.controller';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { adminIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { AdminRole } from '@/database/models/admin';
import { querySchema } from '@server/utils/validate';
import { validateQuery } from '@server/middleware/validate';

const router = Router();

// /api/v1/admin/brand/list
router.get(
  '/list',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  brandController.getBrandsList,
);

// /api/v1/admin/brand/:id/ban
router.delete(
  '/:id/ban',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  brandController.banBrand,
);

// /api/v1/admin/brand/:id/unban
router.put(
  '/:id/unban',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  brandController.unbanBrand,
);

// /api/v1/admin/brand/:id/approve
router.post(
  '/:id/approve',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  brandController.approveBrand,
);
// /api/v1/admin/brand/reviews/all
router.get(
  '/reviews/all',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  brandController.getAllReviews,
);

// /api/v1/admin/brand/:id/reviews
router.get(
  '/:id/reviews',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  brandController.getSpecificBrandReviews,
);

export default router;
