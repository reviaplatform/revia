import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { _formatUser } from '@/core/account/customer';
import { HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { _formatProvider, updateProvider } from '@/core/account/provider';
import { IProviderDB } from '@/database/models/provider';

export async function getMe(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const result = _formatProvider(req.provider! as IProviderDB);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function editMe(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const response = await updateProvider(req.provider!, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
