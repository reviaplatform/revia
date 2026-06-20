import { NextFunction, Response } from 'express';
import { ApiError, HttpStatus } from '@/core/errors';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { validateId } from '@server/types/database';
import { adminListSubscriptions, adminMarkAsPaid } from '@/core/subscription';
import { SubscriptionStatus } from '@/database/models/brandSubscription';

export async function listSubscriptions(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as SubscriptionStatus | undefined;
    const response = await adminListSubscriptions(status);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function markAsPaid(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundSubscription();

    const response = await adminMarkAsPaid(req.admin!, id);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
