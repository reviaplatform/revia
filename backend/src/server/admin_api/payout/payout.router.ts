import { Router } from 'express';
import * as ctrl from './payout.controller';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { adminIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { AdminRole } from '@/database/models/admin';

const router = Router();

// 1. GET /api/v1/admin/payouts
//    List all payouts (filter by ?status=pending|sent|rejected)
router.get('/',
    adminIsAuth,
    adminIsBanned,
    changeLanguage,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    ctrl.getAllPayouts,
);

// 2. PATCH /api/v1/admin/payouts/:id/send
//    Mark a payout as sent
router.patch('/:id/send',
    adminIsAuth,
    adminIsBanned,
    changeLanguage,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    ctrl.markPayoutSent,
);

// 3. PATCH /api/v1/admin/payouts/:id/reject
//    Reject a payout
router.patch('/:id/reject',
    adminIsAuth,
    adminIsBanned,
    changeLanguage,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    ctrl.rejectPayout,
);

// 4. GET /api/v1/admin/payouts/wallet/transactions
//    All wallet transactions (filter by ?brandId=...)
router.get('/wallet/transactions',
    adminIsAuth,
    adminIsBanned,
    changeLanguage,
    adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
    ctrl.getAllWalletTransactions,
);

export default router;
