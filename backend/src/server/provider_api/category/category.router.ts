import { Router } from 'express';
import * as categoryController from './category.controller';
import { querySchema } from '@server/utils/validate';
import { validateQuery } from '@server/middleware/validate';

const router = Router();

// /api/v1/provider/category/list
router.get('/list', validateQuery(querySchema), categoryController.getCategoryList);

export default router;
