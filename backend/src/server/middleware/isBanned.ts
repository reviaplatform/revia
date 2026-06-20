import { ApiError } from '@/core/errors';
import { NextFunction, Response } from 'express';
import { CustomAdminRequest, CustomCustomerRequest, CustomProviderRequest } from './isAuth';
import { CustomerStatus } from '@/database/models/customer';
import BrandModel from '@/database/models/brand';

export async function adminIsBanned(
  req: CustomAdminRequest,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) throw ApiError.invalidAccessToken();
    if (req.admin.deletedAt) throw ApiError.invalidAccessToken();

    const resetPasswordAt = new Date(req.admin.resetPasswordAt).getTime();

    if (req.tokenCreatedAt! < resetPasswordAt) {
      throw ApiError.invalidAccessToken();
    }

    next();
  } catch (err) {
    next(err);
  }
}

export async function userIsBanned(
  req: CustomCustomerRequest,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw ApiError.invalidAccessToken();
    if (req.user.status !== CustomerStatus.ACTIVE || req.user.deletedAt)
      throw ApiError.BannedUserToken();

    next();
  } catch (err) {
    next(err);
  }
}

export async function providerIsBanned(
  req: CustomProviderRequest,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.provider) throw ApiError.invalidAccessToken();
    if (req.provider.deletedAt) throw ApiError.invalidAccessToken();

    const resetPasswordAt = new Date(req.provider.resetPasswordAt).getTime();

    if (req.tokenCreatedAt! < resetPasswordAt) {
      throw ApiError.invalidAccessToken();
    }

    next();
  } catch (err) {
    next(err);
  }
}

export async function providerBrandIsBanned(
  req: CustomProviderRequest,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const brand = await BrandModel.findById(req.provider!.brandId);
    if (!brand || brand.deletedAt) throw ApiError.invalidAccessToken();

    req.brand = brand;

    next();
  } catch (err) {
    next(err);
  }
}
