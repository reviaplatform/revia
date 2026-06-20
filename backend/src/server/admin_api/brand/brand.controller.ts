import {
  getAllBrands,
  banBrand as ba,
  unBanBrand as unba,
  approveBrand as apb,
} from '@/core/brand';
import { adminGetAllBrandReviews, getBrandReviews } from '@/core/brandReview';
import { ApiError, HttpStatus } from '@/core/errors';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { validateId } from '@server/types/database';
import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';

export async function getBrandsList(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await getAllBrands(req.query);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function banBrand(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundBrand();

    const response = await ba(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function unbanBrand(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundBrand();

    const response = await unba(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function approveBrand(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundBrand();

    const response = await apb(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function getAllReviews(_: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await adminGetAllBrandReviews();
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function getSpecificBrandReviews(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundBrand();

    const response = await getBrandReviews(id);
    const result = unwrapResult(response);
    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
