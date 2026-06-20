import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomCustomerRequest } from '@server/middleware/isAuth';
import { getBrandReviews } from '@/core/brandReview';

// GET /api/v1/brand-reviews/:brandId
export async function listBrandReviews(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getBrandReviews(req.params.brandId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}
