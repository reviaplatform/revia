import { Router } from 'express';
import * as ctrl from './payout.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { validateBody } from '@server/middleware/validate';
import { createPayoutSchema } from './payout.valid';

const router = Router();

// 1. POST /api/v1/provider/payouts
//    Submit a payout request
router.post('/',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    validateBody(createPayoutSchema),
    ctrl.createPayout,
);

// 2. GET /api/v1/provider/payouts
//    List own brand's payout requests
router.get('/',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.listPayouts,
);

// 3. GET /api/v1/provider/payouts/wallet/balance
//    Get current wallet balance
router.get('/wallet/balance',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.getWalletBalance,
);

// 4. GET /api/v1/provider/payouts/wallet/transactions
//    Transaction history
router.get('/wallet/transactions',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.getWalletTransactions,
);

export default router;
