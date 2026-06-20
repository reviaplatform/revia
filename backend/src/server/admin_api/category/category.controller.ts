import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { ApiError, HttpStatus } from '@/core/errors';
import { validateId } from '@server/types/database';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { createCategory, getAllCategories, removeCategory, updateCategory } from '@/core/category';

export async function getCategoryList(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await getAllCategories(req.query, 'admin');

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function createNewCategory(
  req: CustomAdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await createCategory(req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Created, result);
  } catch (err) {
    next(err);
  }
}

export async function updateCategoryData(
  req: CustomAdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundCategory();

    const response = await updateCategory(id, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundCategory();

    const response = await removeCategory(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}
