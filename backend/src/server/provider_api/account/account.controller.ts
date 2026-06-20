import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { ApiError, HttpStatus } from '@/core/errors';
import { validateId } from '@server/types/database';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import {
  createProvider,
  getAllProviders,
  providerUpdateProvider,
  banProvider as ba,
  unBanProvider as unba,
} from '@/core/account/provider';

export async function getProviderList(
  req: CustomProviderRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await getAllProviders(req.query, req.providerId!, req.brand!.id);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function createNewProvider(
  req: CustomProviderRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await createProvider({ ...req.body, brandId: req.brand!.id });

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Created, result);
  } catch (err) {
    next(err);
  }
}

export async function updateProviderData(
  req: CustomProviderRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundProvider();

    const response = await providerUpdateProvider(req.provider!, id, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function banProvider(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundProvider();

    const response = await ba(req.provider!, id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function unbanProvider(req: CustomProviderRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundProvider();

    const response = await unba(req.provider!, id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}
