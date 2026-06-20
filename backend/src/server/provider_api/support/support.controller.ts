import { Response, NextFunction } from 'express';
import { HttpStatus } from '@/core/errors';
import * as supportCore from '@/core/support';
import { SupportTicketSenderType } from '@/database/models/supportTicket';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';

export const listMyTickets = async (req: CustomProviderRequest, res: Response, next: NextFunction) => {
    try {
        const response = await supportCore.getBrandSupportTickets(req.provider!.brandId!.toString());
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
};

export const createTicket = async (req: CustomProviderRequest, res: Response, next: NextFunction) => {
    try {
        const response = await supportCore.createSupportTicket(
            { _id: req.provider!.brandId } as any,
            SupportTicketSenderType.BRAND,
            req.body,
        );
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
};
