import AdminModel from '@/database/models/admin';
import bcrypt from 'bcrypt';
import {
  AdminLogin,
  AdminAuthResponse,
  CustomerAuthResponse,
  ProviderLogin,
  ProviderAuthResponse,
  ProviderSignup,
} from './interface';
import { createToken, verifyToken } from './token';
import Config from '@/config/env';
import { ApiError } from '../errors';
import { AsyncSafeResult, SafeResult } from '../types';
import { converTimeToTimeZone, converToTimeZone, parseDuration } from '../utils/functions';
import CustomerModel from '@/database/models/customer';
import { getFileUrl } from '../utils/storage';
import { unwrapResult } from '@server/utils/errors';
import { createCustomer } from '../account/customer';
import { CustomerData } from '../account/customer/interfaces';
import ProviderModel, { ProviderRole } from '@/database/models/provider';
import BrandModel from '@/database/models/brand';
import { createBrand } from '../brand';
import { createProvider } from '../account/provider';

export class JWTAuthService {
  // admin api
  static async adminLogin(userData: AdminLogin): AsyncSafeResult<AdminAuthResponse> {
    try {
      const { email, password } = userData;

      const admin = await AdminModel.findOne({ email });
      if (!admin) throw ApiError.invalidEmailCredentials();
      if (admin.deletedAt) throw ApiError.invalidEmailCredentials();

      const validPass = await bcrypt.compare(password, admin.password);
      if (!validPass) throw ApiError.invalidEmailCredentials();

      const accessToken = createToken(
        { id: admin._id, iat: Math.floor(Date.now() / 1000) },
        Config.ADMIN_ACCESS_TOKEN_KEY,
        Config.ADMIN_ACCESS_TOKEN_EXP,
      );

      const result: AdminAuthResponse = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role as string,
        languagePreference: userData.languagePreference || admin.languagePreference,
        lastLoginAt: converTimeToTimeZone(admin.lastLoginAt),
        deletedAt: admin.deletedAt ? converTimeToTimeZone(admin.deletedAt) : null,
        createdAt: converTimeToTimeZone(admin.createdAt),
        accessToken,
        accessTokenExpireTime: new Date(parseDuration(Config.ADMIN_ACCESS_TOKEN_EXP)),
      };

      admin.languagePreference = userData.languagePreference || admin.languagePreference;
      admin.lastLoginAt = new Date();
      await admin.save();

      return { result, error: null };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  static verifyAdminAccessToken(token: string): SafeResult<string> {
    try {
      return {
        result: verifyToken(token, Config.ADMIN_ACCESS_TOKEN_KEY, 'access').id as string,
        error: null,
      };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  static verifyAdminAccessTokenWithResetPassword(token: string): SafeResult<number> {
    try {
      return {
        result: verifyToken(token, Config.ADMIN_ACCESS_TOKEN_KEY, 'access').iat as number,
        error: null,
      };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  // app api
  static async userRegister(userData: CustomerData): AsyncSafeResult<CustomerAuthResponse> {
    try {
      const user = unwrapResult(await createCustomer(userData));

      const accessToken = createToken(
        { id: user.id, isGuest: false },
        Config.USER_ACCESS_TOKEN_KEY,
        Config.USER_ACCESS_TOKEN_EXP,
      );

      const refreshToken = createToken(
        { id: user.id },
        Config.USER_REFRESH_TOKEN_KEY,
        Config.USER_REFRESH_TOKEN_EXP,
      );

      const result: CustomerAuthResponse = {
        id: user.id.toString(),
        name: user.name,
        picture: user.picture ? await getFileUrl(user.picture) : null,
        phoneNumber: user.phoneNumber,
        status: user.status,
        email: user.email,
        languagePreference: user.languagePreference || 'en',
        gender: user.gender,
        birthday: user.birthday,
        location: user.location,
        deletedAt: user.deletedAt ? converToTimeZone(user.deletedAt) : null,
        lastLoginAt: converToTimeZone(user.lastLoginAt),
        createdAt: converToTimeZone(user.createdAt),
        accessToken,
        refreshToken,
        accessTokenExpireTime: new Date(parseDuration(Config.USER_ACCESS_TOKEN_EXP)),
        refreshTokenExpireTime: new Date(parseDuration(Config.USER_REFRESH_TOKEN_EXP)),
      };

      return { result: result, error: null };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  static verifyUserAccessToken(token: string): SafeResult<{ userId: string }> {
    try {
      const data = verifyToken(token, Config.USER_ACCESS_TOKEN_KEY, 'access');

      return {
        result: {
          userId: data.id as string,
        },
        error: null,
      };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  static verifyRegisterToken(token: string): SafeResult<string> {
    try {
      return {
        result: verifyToken(token, Config.REGISTER_ACCESS_TOKEN_KEY, 'register')
          .phoneNumber as string,
        error: null,
      };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  // app api
  static async userRefreshToken(token: string): AsyncSafeResult<string> {
    try {
      const payload = verifyToken(token, Config.USER_REFRESH_TOKEN_KEY, 'refresh');

      const user = await CustomerModel.findById(payload.id);
      if (!user) throw ApiError.invalidRefreshToken();

      if (user.deletedAt) throw ApiError.BannedUserToken();

      const newAccessToken = createToken(
        { id: user._id },
        Config.USER_ACCESS_TOKEN_KEY,
        Config.USER_ACCESS_TOKEN_EXP,
      );

      return { error: null, result: newAccessToken };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  // provider api
  static async providerLogin(userData: ProviderLogin): AsyncSafeResult<ProviderAuthResponse> {
    try {
      const { phoneNumber, password } = userData;

      const provider = await ProviderModel.findOne({ phoneNumber }).select('+password').exec();
      if (!provider) throw ApiError.invalidPhoneCredentials();
      if (provider.deletedAt) {
        throw ApiError.unauthorized();
      }

      const validPass = await bcrypt.compare(password, provider.password);
      if (!validPass) throw ApiError.invalidPhoneCredentials();

      const brand = await BrandModel.findById(provider.brandId);
      if (!brand) throw ApiError.invalidPhoneCredentials();
      if (brand.deletedAt) throw ApiError.invalidPhoneCredentials();

      const accessToken = createToken(
        { id: provider._id, iat: Math.floor(Date.now() / 1000) },
        Config.PROVIDER_ACCESS_TOKEN_KEY,
        Config.PROVIDER_ACCESS_TOKEN_EXP,
      );

      const result: ProviderAuthResponse = {
        id: provider.id,
        accessToken,
        accessTokenExpireTime: new Date(parseDuration(Config.PROVIDER_ACCESS_TOKEN_EXP)),
        name: provider.name,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        role: provider.role,
        deletedAt: provider.deletedAt ? converTimeToTimeZone(provider.deletedAt) : null,
        createdAt: converTimeToTimeZone(provider.createdAt),
        lastLoginAt: converTimeToTimeZone(provider.lastLoginAt),
        languagePreference: userData.languagePreference || provider.languagePreference,
        brand: null,
      };

      provider.languagePreference = userData.languagePreference || provider.languagePreference;
      provider.lastLoginAt = new Date();
      await provider.save();

      return { result, error: null };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  // provider api
  static async providerSignup(
    data: ProviderSignup,
    languagePreference: 'ar' | 'en',
  ): AsyncSafeResult<ApiError | null> {
    try {
      const createNewBrand = await createBrand(data.brandData);
      const brand = unwrapResult(createNewBrand);

      const createNewProvider = await createProvider({
        ...data.providerData,
        languagePreference,
        role: ProviderRole.OWNER,
        brandId: brand.id,
      });
      unwrapResult(createNewProvider);

      return { result: null, error: null };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  static verifyProviderAccessToken(token: string): SafeResult<string> {
    try {
      return {
        result: verifyToken(token, Config.PROVIDER_ACCESS_TOKEN_KEY, 'access').id as string,
        error: null,
      };
    } catch (err) {
      return { error: err, result: null };
    }
  }

  static verifyProviderAccessTokenWithResetPassword(token: string): SafeResult<number> {
    try {
      return {
        result: verifyToken(token, Config.PROVIDER_ACCESS_TOKEN_KEY, 'access').iat as number,
        error: null,
      };
    } catch (err) {
      return { error: err, result: null };
    }
  }
}
