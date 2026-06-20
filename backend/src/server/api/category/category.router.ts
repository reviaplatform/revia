import { Router } from 'express';
import * as categoryController from './category.controller';
import { querySchema } from '@server/utils/validate';
import { changeLanguage } from '@server/middleware/language';
import { validateQuery } from '@server/middleware/validate';
import { isAuth } from '@server/middleware/isAuth';
import { userIsBanned } from '@server/middleware/isBanned';

const router = Router();

// /api/v1/category/list
router.get(
  '/list',
  isAuth,
  userIsBanned,
  changeLanguage,
  validateQuery(querySchema),
  categoryController.getCategoryList,
);

export default router;
