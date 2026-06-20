import { Router } from 'express';
import * as ctrl from './repairRequest.controller';
import { isAuth } from '@server/middleware/isAuth';
import { userIsBanned } from '@server/middleware/isBanned';
import { validateBody } from '@server/middleware/validate';
import { uploadMultiData } from '@server/middleware/multer';
import { processChatAttachments } from '@server/middleware/imageProcessing';
import {
    createRepairRequestSchema,
    sendMessageSchema,
    finishChatSchema,
    selectOfferSchema,
    reviewRequestSchema,
} from './repairRequest.valid';

const router = Router();

// ---------------------------------------------------------------------------
// Repair Requests
// ---------------------------------------------------------------------------

// 12. GET /api/v1/repair-requests — list all own requests
router.get('/',
    isAuth,
    userIsBanned,
    ctrl.listMyRequests,
);

// GET /api/v1/repair-requests/:requestId — single request
router.get('/:requestId',
    isAuth,
    userIsBanned,
    ctrl.getOne,
);

// 1. POST /api/v1/repair-requests — create (flow 1 or 2)
router.post('/',
    isAuth,
    userIsBanned,
    uploadMultiData([{ name: 'attachments', maxCount: 5 }]),
    processChatAttachments,
    validateBody(createRepairRequestSchema),
    ctrl.create,
);

// 11. DELETE /api/v1/repair-requests/:requestId — cancel
router.delete('/:requestId',
    isAuth,
    userIsBanned,
    ctrl.cancel,
);

// ---------------------------------------------------------------------------
// Chat (Flow 2)
// ---------------------------------------------------------------------------

// 3. GET /api/v1/repair-requests/:requestId/chat — get chat history
router.get('/:requestId/chat',
    isAuth,
    userIsBanned,
    ctrl.getChatMessages,
);

router.post('/:requestId/chat/messages',
    isAuth,
    userIsBanned,
    uploadMultiData([{ name: 'attachments', maxCount: 5 }]),
    processChatAttachments,
    validateBody(sendMessageSchema),
    ctrl.sendChatMessage,
);

// 4 & 5. POST /api/v1/repair-requests/:requestId/chat/finish — finish chat
//         closeRequest: true  → close the request (Flow 2 dead-end)
//         closeRequest: false → forward to brands
router.post('/:requestId/chat/finish',
    isAuth,
    userIsBanned,
    validateBody(finishChatSchema),
    ctrl.finishChatHandler,
);

// ---------------------------------------------------------------------------
// Offers
// ---------------------------------------------------------------------------

// 6. GET /api/v1/repair-requests/:requestId/offers — list offers
router.get('/:requestId/offers',
    isAuth,
    userIsBanned,
    ctrl.listOffers,
);

// GET /api/v1/repair-requests/:requestId/remaining-offers
router.get('/:requestId/remaining-offers',
    isAuth,
    userIsBanned,
    ctrl.getRemainingOffersStatus,
);

// 7. POST /api/v1/repair-requests/:requestId/select-offer — choose offer
router.post('/:requestId/select-offer',
    isAuth,
    userIsBanned,
    validateBody(selectOfferSchema),
    ctrl.chooseOffer,
);

// ---------------------------------------------------------------------------
// Payments & Inspection
// ---------------------------------------------------------------------------

// 8. POST /api/v1/repair-requests/:requestId/pay-inspection
router.post('/:requestId/pay-inspection',
    isAuth,
    userIsBanned,
    ctrl.payInspection,
);

// 9. GET /api/v1/repair-requests/:requestId/inspection — get result
router.get('/:requestId/inspection',
    isAuth,
    userIsBanned,
    ctrl.getInspection,
);

// 10. POST /api/v1/repair-requests/:requestId/pay-final
router.post('/:requestId/pay-final',
    isAuth,
    userIsBanned,
    ctrl.payFinal,
);

// 13. POST /api/v1/repair-requests/:requestId/review
router.post('/:requestId/review',
    isAuth,
    userIsBanned,
    validateBody(reviewRequestSchema),
    ctrl.createReview,
);

export default router;
