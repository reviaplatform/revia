import { getAllCategories } from '@/core/category';
import { HttpStatus } from '@/core/errors';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';

export async function getCategoryList(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await getAllCategories(req.query, 'provider');

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
