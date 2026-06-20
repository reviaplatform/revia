import { Router } from 'express';
import * as ctrl from './repairRequest.controller';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { adminIsBanned } from '@server/middleware/isBanned';
import { AdminRole } from '@/database/models/admin';
import { validateQuery } from '@server/middleware/validate';
import { querySchema } from '@server/utils/validate';

const router = Router();

// GET /api/v1/admin/repair-requests
router.get('/',
    adminIsAuth,
    adminIsBanned,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    validateQuery(querySchema),
    ctrl.listAllRequests,
);

// GET /api/v1/admin/repair-requests/:requestId
router.get('/:requestId',
    adminIsAuth,
    adminIsBanned,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    validateQuery(querySchema),
    ctrl.getRequest,
);

// GET /api/v1/admin/repair-requests/:requestId/inspection
router.get('/:requestId/inspection',
    adminIsAuth,
    adminIsBanned,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    validateQuery(querySchema),
    ctrl.getRequestInspection,
);

export default router;
