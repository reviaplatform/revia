import { NextFunction, Request, Response } from 'express';
import AdminModel, { IAdminDB } from '@/database/models/admin';
import { ApiError } from '@/core/errors';
import { unwrapResult } from '@server/utils/errors';
import { validateId } from '@server/types/database';
import { JWTAuthService } from '@/core/auth';
import CustomerModel, { ICustomerDB } from '@/database/models/customer';
import ProviderModel, { IProviderDB } from '@/database/models/provider';
import { IBrandDB } from '@/database/models/brand';

export interface CustomLangRequest extends Request {
  lang?: 'ar' | 'en';
}

export interface CustomCustomerRequest extends Request {
  userId?: string;
  user?: ICustomerDB | null;
  phoneNumber?: string;
  lang?: 'ar' | 'en';
}

export interface CustomAdminRequest extends Request {
  adminId?: string;
  admin?: IAdminDB | null;
  lang?: 'ar' | 'en';
  tokenCreatedAt?: number;
}

export interface CustomProviderRequest extends Request {
  providerId?: string;
  provider?: IProviderDB | null;
  brand?: IBrandDB | null;
  lang?: 'ar' | 'en';
  tokenCreatedAt?: number;
}

const extractToken = (authHeader: string | undefined): string => {
  if (!authHeader) {
    throw ApiError.invalidAccessToken();
  }

  const splitHeader = authHeader.split(' ');
  if (splitHeader.length !== 2 && splitHeader[0] !== 'Bearer') {
    throw ApiError.invalidAccessToken();
  }

  const token = splitHeader[1];

  return token;
};

async function fetchAdmin(adminId: string): Promise<IAdminDB | null> {
  const admin = (await AdminModel.findById(adminId)) || null;
  return admin;
}

export async function adminIsAuth(req: CustomAdminRequest, _: Response, next: NextFunction) {
  try {
    const token = extractToken(req.get('Authorization'));

    const admin = JWTAuthService.verifyAdminAccessToken(token);

    unwrapResult(admin);

    const adminId = admin.result!.toString();
    if (!validateId(adminId)) throw ApiError.invalidAccessToken();

    const tokenCreatedAt = JWTAuthService.verifyAdminAccessTokenWithResetPassword(token);
    unwrapResult(tokenCreatedAt);
    let tokenCreatedAtNumber = tokenCreatedAt.result! * 1000; // Convert to milliseconds
    tokenCreatedAtNumber = new Date(tokenCreatedAtNumber).getTime();

    req.adminId = adminId;
    req.admin = await fetchAdmin(req.adminId!);
    req.lang = req.admin?.languagePreference ?? 'en';
    req.tokenCreatedAt = tokenCreatedAtNumber;

    next();
  } catch (err) {
    next(err);
  }
}

export function adminAllowedTo(...roles: string[]) {
  return async (req: CustomAdminRequest, _: Response, next: NextFunction) => {
    try {
      if (!roles.includes(req.admin?.role ?? '')) {
        return next(ApiError.unauthorized());
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

async function fetchCustomer(userId: string): Promise<ICustomerDB | null> {
  const user = (await CustomerModel.findById(userId)) || null;
  return user;
}

export async function isAuth(req: CustomCustomerRequest, _: Response, next: NextFunction) {
  try {
    const token = extractToken(req.get('Authorization'));

    const user = JWTAuthService.verifyUserAccessToken(token);

    unwrapResult(user);

    const userId = user.result!.userId.toString();

    if (!validateId(userId)) throw ApiError.invalidAccessToken();

    req.userId = userId;
    req.user = await fetchCustomer(req.userId!);
    req.lang = req.user?.languagePreference ?? 'en';

    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req: CustomCustomerRequest, _: Response, next: NextFunction) {
  try {
    const token = extractToken(req.get('Authorization'));

    const user = JWTAuthService.verifyUserAccessToken(token);

    if (user.error) {
      return next();
    }

    const userId = user.result!.userId.toString();

    if (!validateId(userId)) {
      return next();
    }

    req.userId = userId;
    req.user = await fetchCustomer(req.userId!);
    req.lang = req.user?.languagePreference ?? 'en';

    next();
  } catch (err) {
    next();
  }
}

export async function register(req: CustomCustomerRequest, _: Response, next: NextFunction) {
  try {
    const token = extractToken(req.get('Authorization'));

    const phoneNumber = JWTAuthService.verifyRegisterToken(token);

    unwrapResult(phoneNumber);

    req.phoneNumber = phoneNumber.result!.toString();

    next();
  } catch (err) {
    next(err);
  }
}

async function fetchProvider(providerId: string): Promise<IProviderDB | null> {
  const provider = (await ProviderModel.findById(providerId)) || null;
  return provider;
}

export async function providerIsAuth(req: CustomProviderRequest, _: Response, next: NextFunction) {
  try {
    const token = extractToken(req.get('Authorization'));

    const provider = JWTAuthService.verifyProviderAccessToken(token);

    unwrapResult(provider);

    const providerId = provider.result!.toString();
    if (!validateId(providerId)) throw ApiError.invalidAccessToken();

    const tokenCreatedAt = JWTAuthService.verifyProviderAccessTokenWithResetPassword(token);
    unwrapResult(tokenCreatedAt);
    let tokenCreatedAtNumber = tokenCreatedAt.result! * 1000; // Convert to milliseconds
    tokenCreatedAtNumber = new Date(tokenCreatedAtNumber).getTime();

    req.providerId = providerId;
    req.provider = (await fetchProvider(req.providerId))!;
    req.lang = req.provider?.languagePreference ?? 'en';
    req.tokenCreatedAt = tokenCreatedAtNumber;

    next();
  } catch (err) {
    next(err);
  }
}
