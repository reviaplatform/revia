import { _formatBrandInProvider, updateBrand } from '@/core/brand';
import { HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { providerGetOwnBrandReviews } from '@/core/brandReview';

export async function getBrand(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    // Populate categories
    await req.brand!.populate('categories');

    const result = await _formatBrandInProvider(req.brand!);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function updateBrandData(
  req: CustomProviderRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await updateBrand(req.brand!, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function getOwnReviews(
  req: CustomProviderRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await providerGetOwnBrandReviews(req.provider!);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
