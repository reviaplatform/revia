import { unwrapResult } from '@server/utils/errors';
import { Request, Response, NextFunction } from 'express';
import { CustomerAuthResponse, JWTAuthService, createAndSendPhoneOTP, deleteOTP, validatePhoneOTP } from '@/core/auth';
import { ApiError, HttpStatus } from '@/core/errors';
import { OTPType } from '@/database/models/otp';
import Config from '@/config/env';
import { createToken } from '@/core/auth/token';
import { CustomCustomerRequest } from '@server/middleware/isAuth';
import { converToTimeZone, parseDuration } from '@/core/utils/functions';
import { changeI18Language } from '@server/utils/i18n';
import CustomerModel from '@/database/models/customer';
import { getFileUrl } from '@/core/utils/storage';

export async function sendOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const user = await CustomerModel.findOne({ phoneNumber });

    if (user) {
      await createAndSendPhoneOTP(phoneNumber, OTPType.PHONE_VERIFICATION, user.languagePreference);
    } else {
      await createAndSendPhoneOTP(phoneNumber, OTPType.PHONE_VERIFICATION, 'en');
    }

    const userStatus = user ? (user.deletedAt ? 1 : 1) : 0;

    return res.JSON(HttpStatus.Ok, { user: userStatus });
  } catch (err) {
    next(err);
  }
}

export async function validateExistUserOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, otp, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const user = await CustomerModel.findOne({ phoneNumber });
    if (!user) {
      throw new ApiError('User does not exist.', HttpStatus.BadRequest);
    }

    const isValidated = await validatePhoneOTP(
      otp.toString(),
      phoneNumber,
      OTPType.PHONE_VERIFICATION,
      false,
    );
    if (!isValidated) throw ApiError.invalidOTP();

    await deleteOTP(otp.toString(), phoneNumber, OTPType.PHONE_VERIFICATION);

    await user.updateOne({ languagePreference, devices: [] });

    user.languagePreference = languagePreference;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = createToken(
      { id: user.id.toString(), isGuest: false },
      Config.USER_ACCESS_TOKEN_KEY,
      Config.USER_ACCESS_TOKEN_EXP,
    );

    const refreshToken = createToken(
      { id: user.id.toString() },
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

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function validateNotExistUserOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, otp, languagePreference } = req.body;

    await changeI18Language(languagePreference || 'en');

    const [user, isValidated] = await Promise.all([
      CustomerModel.findOne({ phoneNumber }),
      validatePhoneOTP(otp.toString(), phoneNumber, OTPType.PHONE_VERIFICATION, false),
    ]);

    if (!isValidated) throw ApiError.invalidOTP();

    if (user) throw ApiError.duplicateUser();

    await deleteOTP(otp.toString(), phoneNumber, OTPType.PHONE_VERIFICATION);

    const registerToken = createToken(
      { phoneNumber },
      Config.REGISTER_ACCESS_TOKEN_KEY,
      Config.REGISTER_ACCESS_TOKEN_EXP,
    );

    res.JSON(HttpStatus.Ok, { registerToken });
  } catch (err) {
    next(err);
  }
}

export async function register(req: CustomCustomerRequest, res: Response, next: NextFunction) {
  try {
    await changeI18Language(req.body.languagePreference);

    req.body.phoneNumber = req.phoneNumber;
    const response = await JWTAuthService.userRegister(req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.get('X-Refresh-Token');
    if (!refreshToken) throw ApiError.invalidRefreshToken();

    const response = await JWTAuthService.userRefreshToken(refreshToken);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Created, {
      accessToken: result,
      accessTokenExpireTime: new Date(parseDuration(Config.USER_ACCESS_TOKEN_EXP)),
    });
  } catch (err) {
    next(err);
  }
}
