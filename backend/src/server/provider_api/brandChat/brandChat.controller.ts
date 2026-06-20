import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { getBrandChatSession, sendBrandMessage, startBrandChatSession } from '@/core/brandChat';
import { simulateBrandAiReply } from './brandChat.socket';

export async function getSession(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await getBrandChatSession(req.brand!, req.provider!);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function startNewSession(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await startBrandChatSession(req.brand!, req.provider!);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await sendBrandMessage(req.brand!, req.provider!, {
      content: req.body.content,
      file: req.file,
    });
    const result = unwrapResult(response);

    // Trigger AI reply via Socket — scoped to this specific provider
    const brandId = req.brand!._id!.toString();
    const providerId = req.provider!._id!.toString();
    simulateBrandAiReply(req.app.get('io'), brandId, providerId).catch(() => { });

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
