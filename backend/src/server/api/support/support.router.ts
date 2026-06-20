import { Router } from 'express';
import * as ctrl from './support.controller';
import { isAuth } from '@server/middleware/isAuth';
import { userIsBanned } from '@server/middleware/isBanned';
import { validateBody } from '@server/middleware/validate';
import { createSupportTicketSchema } from './support.valid';

const router = Router();

router.get('/',
    isAuth,
    userIsBanned,
    ctrl.listMyTickets,
);

router.post('/',
    isAuth,
    userIsBanned,
    validateBody(createSupportTicketSchema),
    ctrl.createTicket,
);

export default router;
