import { Response, NextFunction } from 'express';
import { HttpStatus } from '@/core/errors';
import * as supportCore from '@/core/support';
import { SupportTicketSenderType } from '@/database/models/supportTicket';
import { CustomCustomerRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';

export const listMyTickets = async (req: CustomCustomerRequest, res: Response, next: NextFunction) => {
    try {
        const response = await supportCore.getCustomerSupportTickets(req.user?._id?.toString() as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
};

export const createTicket = async (req: CustomCustomerRequest, res: Response, next: NextFunction) => {
    try {
        const response = await supportCore.createSupportTicket(
            req.user!,
            SupportTicketSenderType.CUSTOMER,
            req.body,
        );
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
};
