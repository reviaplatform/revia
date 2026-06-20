import { adminIsBanned } from '@server/middleware/isBanned';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { AdminRole } from '@/database/models/admin';
import { Router } from 'express';
import * as categoryController from './category.controller';
import { querySchema } from '@server/utils/validate';
import { createCategoryDataSchema, updateCategoryDataSchema } from './category.valid';
import { changeLanguage } from '@server/middleware/language';
import { validateBody, validateQuery } from '@server/middleware/validate';

const router = Router();

// /api/v1/admin/category/list
router.get(
  '/list',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  validateQuery(querySchema),
  categoryController.getCategoryList,
);

// /api/v1/admin/category/create
router.post(
  '/create',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  validateBody(createCategoryDataSchema),
  categoryController.createNewCategory,
);

// /api/v1/admin/acc/:id/update
router.put(
  '/:id/update',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  validateBody(updateCategoryDataSchema),
  categoryController.updateCategoryData,
);

// /api/v1/admin/acc/:id/delete
router.delete(
  '/:id/delete',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  categoryController.deleteCategory,
);

export default router;
