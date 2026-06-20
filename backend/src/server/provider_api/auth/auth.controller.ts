import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Request, Response } from 'express';
import { createAndSendPhoneOTP, deleteOTP, JWTAuthService, validatePhoneOTP } from '@/core/auth';
import { ApiError, HttpStatus } from '@/core/errors';
import { ProviderLogin, ProviderSignup } from '@/core/auth/interface';
import { OTPType } from '@/database/models/otp';
import ProviderModel from '@/database/models/provider';
import bcrypt from 'bcrypt';
import { changeI18Language } from '@server/utils/i18n';
import { PASSWORD_SALT_ROUNDS } from '@/core/types';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { languagePreference, ...loginDetails }: ProviderLogin = req.body;

    // Set language preference for the request
    await changeI18Language(languagePreference);

    const response = await JWTAuthService.providerLogin({ ...loginDetails, languagePreference });

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { languagePreference, ...signupDetails }: ProviderSignup = req.body;

    // Set language preference for the request
    await changeI18Language(languagePreference);

    const response = await JWTAuthService.providerSignup({ ...signupDetails, languagePreference }, languagePreference);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const provided = await ProviderModel.findOne({ phoneNumber });
    if (!provided || provided.deletedAt) return res.JSON(HttpStatus.Ok); // Not Existing

    await createAndSendPhoneOTP(phoneNumber, OTPType.FORGOT_PASSWORD, provided.languagePreference);

    return res.JSON(HttpStatus.Ok); // Existing
  } catch (err) {
    next(err);
  }
}

export async function verifyPasswordOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, otp, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const isValid = await validatePhoneOTP(
      otp.toString(),
      phoneNumber,
      OTPType.FORGOT_PASSWORD,
      false,
    );
    if (!isValid) throw ApiError.invalidOTP();

    res.JSON(HttpStatus.Ok, isValid);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, newPassword, otp, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const provider = await ProviderModel.findOne({ phoneNumber }).select('+password');
    if (!provider || provider.deletedAt) throw ApiError.invalidOTP();

    const isValidOTP = await validatePhoneOTP(otp, phoneNumber, OTPType.FORGOT_PASSWORD, false);
    if (!isValidOTP) throw ApiError.invalidOTP();

    await deleteOTP(otp, phoneNumber, OTPType.FORGOT_PASSWORD);

    provider.password = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    provider.resetPasswordAt = new Date(); // Set reset timestamp to invalidate old tokens
    await provider.save();

    res.JSON(HttpStatus.Ok);
  } catch (err) {
    next(err);
  }
}
