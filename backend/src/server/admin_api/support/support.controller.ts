import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '@/core/errors';
import * as supportCore from '@/core/support';
import { unwrapResult } from '@server/utils/errors';

export const listAllTickets = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await supportCore.adminListSupportTickets();
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const response = await supportCore.adminUpdateSupportTicketStatus(id as string, req.body);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
};
