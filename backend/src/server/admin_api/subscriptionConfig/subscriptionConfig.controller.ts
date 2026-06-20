import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { getSubscriptionConfig, updateSubscriptionConfig } from '@/core/subscription';

export async function getConfig(_req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await getSubscriptionConfig();
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const { priceEGP, durationDays } = req.body as { priceEGP: number; durationDays: number };
    const response = await updateSubscriptionConfig(req.admin!, priceEGP, durationDays);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
