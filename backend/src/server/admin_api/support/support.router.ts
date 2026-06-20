import { Router } from 'express';
import * as ctrl from './support.controller';
import { adminIsAuth } from '@server/middleware/isAuth';
import { validateBody } from '@server/middleware/validate';
import { updateSupportTicketStatusSchema } from './support.valid';

const router = Router();

router.get('/',
    adminIsAuth,
    ctrl.listAllTickets,
);

router.patch('/:id',
    adminIsAuth,
    validateBody(updateSupportTicketStatusSchema),
    ctrl.updateTicketStatus,
);

export default router;
