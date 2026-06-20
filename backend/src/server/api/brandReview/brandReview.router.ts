import { Router } from 'express';
import * as ctrl from './brandReview.controller';
import { isAuth } from '@server/middleware/isAuth';
import { userIsBanned } from '@server/middleware/isBanned';

const router = Router();

// GET /api/v1/brand-reviews/:brandId
router.get('/:brandId',
    isAuth,
    userIsBanned,
    ctrl.listBrandReviews,
);

export default router;
