import { NextFunction, Response, Request } from 'express';
import { CustomCustomerRequest } from '@server/middleware/isAuth';
import { HttpStatus } from '@/core/errors';
import * as reelService from '@/core/reel';
import { unwrapResult } from '@server/utils/errors';

export async function getReels(req: CustomCustomerRequest, res: Response, next: NextFunction) {
  try {
    const customerId = (req.user as any)?._id?.toString() || null;
    const identifier = customerId || req.ip || 'anonymous';

    const response = await reelService.getUserReels(customerId, identifier, req.query as any);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err: any) {
    next(err);
  }
}

export async function likeReel(req: CustomCustomerRequest, res: Response, next: NextFunction) {
  try {
    const response = await reelService.likeReel(req.params.id as string, (req.user as any)._id.toString());

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err: any) {
    next(err);
  }
}

export async function unlikeReel(req: CustomCustomerRequest, res: Response, next: NextFunction) {
  try {
    const response = await reelService.unlikeReel(req.params.id as string, (req.user as any)._id.toString());

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err: any) {
    next(err);
  }
}

export async function viewReel(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await reelService.recordView(req.params.id as string);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err: any) {
    next(err);
  }
}
