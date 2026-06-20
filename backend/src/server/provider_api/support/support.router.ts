import { Router } from 'express';
import * as ctrl from './support.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerIsBanned, providerBrandIsBanned } from '@server/middleware/isBanned';
import { validateBody } from '@server/middleware/validate';
import { createSupportTicketSchema } from './support.valid';

const router = Router();

router.get('/',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    ctrl.listMyTickets,
);

router.post('/',
    providerIsAuth,
    providerIsBanned,
    providerBrandIsBanned,
    validateBody(createSupportTicketSchema),
    ctrl.createTicket,
);

export default router;
