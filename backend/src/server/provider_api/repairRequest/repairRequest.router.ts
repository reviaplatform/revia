import { Router } from 'express';
import * as ctrl from './repairRequest.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { validateBody } from '@server/middleware/validate';
import { sendOfferSchema, sendInspectionSchema, payPaymentSchema } from './repairRequest.valid';
import { changeLanguage } from '@server/middleware/language';

const router = Router();

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

// 1. GET /api/v1/provider/repair-requests/active
//    Requests in progress past offer stage
router.get('/active',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.listActiveRequests,
);

// 2. GET /api/v1/provider/repair-requests/pending-offers
//    Requests waiting for this brand's offer
router.get('/pending-offers',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.listPendingOfferRequests,
);

// 3. GET /api/v1/provider/repair-requests/:requestId
//    Get a single repair request by ID
router.get('/:requestId',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.getSingleRequest,
);

// ---------------------------------------------------------------------------
// Actions on a specific request
// ---------------------------------------------------------------------------

// 3. POST /api/v1/provider/repair-requests/:requestId/offer
router.post('/:requestId/offer',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    validateBody(sendOfferSchema),
    ctrl.sendOffer,
);

// 4. POST /api/v1/provider/repair-requests/:requestId/inspection
router.post('/:requestId/inspection',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    validateBody(sendInspectionSchema),
    ctrl.sendInspection,
);

// 5. POST /api/v1/provider/repair-requests/:requestId/finish
router.post('/:requestId/finish',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.finishRepair,
);

// 6. POST /api/v1/provider/repair-requests/:requestId/user-get-device
router.post('/:requestId/user-get-device',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.giveDeviceToUser,
);

// 7. POST /api/v1/repair-requests/:requestId/pay-inspection
router.post('/:requestId/pay-inspection',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    changeLanguage,
    validateBody(payPaymentSchema),
    ctrl.payInspection,
);

// 8. POST /api/v1/repair-requests/:requestId/pay-final
router.post('/:requestId/pay-final',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    changeLanguage,
    validateBody(payPaymentSchema),
    ctrl.payFinal,
);

export default router;
