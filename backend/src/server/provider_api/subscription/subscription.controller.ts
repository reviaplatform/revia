import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import {
  getSubscriptionConfig,
  requestSubscription,
  getMySubscription,
} from '@/core/subscription';

export async function getPricing(_req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await getSubscriptionConfig();
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function createSubscription(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await requestSubscription(req.brand!);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Created, result);
  } catch (err) {
    next(err);
  }
}

export async function getSubscription(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await getMySubscription(req.brand!);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
