import { NextFunction, Response } from 'express';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { HttpStatus } from '@/core/errors';
import * as reelService from '@/core/reel';
import { unwrapResult } from '@server/utils/errors';
import ReelModel from '@/database/models/reel';
import { ApiError } from '@/core/errors';

export async function createReel(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const { videoBuffer, videoMimetype, thumbnailBuffer } = req.body;

    if (!videoBuffer || !thumbnailBuffer) {
      throw ApiError.pleaseTryAgain();
    }

    const response = await reelService.createReel(req.brand!, {
      caption: req.body.caption,
      tags: req.body.tags ?? [],
      video: videoBuffer,
      videoMimetype,
      thumbnail: thumbnailBuffer,
    });

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Created, result);
  } catch (err: any) {
    next(err);
  }
}

export async function updateReel(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const reel = await ReelModel.findOne({ _id: req.params.id, brand: req.brand!._id, deletedAt: null });
    if (!reel) throw ApiError.notFoundReel();

    const response = await reelService.updateReel(reel, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err: any) {
    next(err);
  }
}

export async function deleteReel(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const reel = await ReelModel.findOne({ _id: req.params.id, brand: req.brand!._id, deletedAt: null });
    if (!reel) throw ApiError.notFoundReel();

    const response = await reelService.deleteReel(reel);

    unwrapResult(response);

    res.JSON(HttpStatus.Ok, null);
  } catch (err: any) {
    next(err);
  }
}

export async function getMyReels(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await reelService.getBrandReels(req.brand!._id!.toString());

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err: any) {
    next(err);
  }
}
