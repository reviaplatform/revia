import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { getBrandAnalytics } from '@/core/analytics';
import { AnalyticsPeriod } from '@/core/analytics/interfaces';

export async function getAnalytics(
    req: CustomProviderRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const period = (req.query.period as AnalyticsPeriod) ?? '30d';
        const response = await getBrandAnalytics(req.brand!, period);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}
