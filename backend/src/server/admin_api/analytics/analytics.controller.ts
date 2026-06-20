import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { getAdminAnalytics } from '@/core/adminAnalytics';
import { AnalyticsPeriod } from '@/core/adminAnalytics/interfaces';

export async function getAnalytics(
    req: CustomAdminRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const period = (req.query.period as AnalyticsPeriod) ?? '30d';
        const response = await getAdminAnalytics(period);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}
