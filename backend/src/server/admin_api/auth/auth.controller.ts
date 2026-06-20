import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Request, Response } from 'express';
import { createAndSendEmailOTP, deleteMailOTP, JWTAuthService, validateEmailOTP } from '@/core/auth';
import { AdminLogin } from '@/core/auth/interface';
import { ApiError, HttpStatus } from '@/core/errors';
import AdminModel from '@/database/models/admin';
import bcrypt from 'bcrypt';
import { changeI18Language } from '@server/utils/i18n';
import { PASSWORD_SALT_ROUNDS } from '@/core/types';
import { OTPType } from '@/database/models/otp';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { languagePreference, ...loginDetails }: AdminLogin = req.body;

    // Set language preference for the request
    await changeI18Language(languagePreference);

    // Perform login using the provided details
    const response = await JWTAuthService.adminLogin({ ...loginDetails, languagePreference });

    const result = unwrapResult(response);

    // Respond with the login result
    return res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const admin = await AdminModel.findOne({ email });
    if (!admin || admin.deletedAt) return res.JSON(HttpStatus.Ok);

    const otpCreated = await createAndSendEmailOTP(email, OTPType.FORGOT_PASSWORD);
    if (!otpCreated) throw ApiError.tryAgain();

    return res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function verifyPasswordOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const isValid = await validateEmailOTP(otp.toString(), email, OTPType.FORGOT_PASSWORD, false);
    if (!isValid) throw ApiError.invalidOTP();

    return res.JSON(HttpStatus.Ok, isValid);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, newPassword, otp, languagePreference } = req.body;

    await changeI18Language(languagePreference);

    const admin = await AdminModel.findOne({ email }).select('+password');
    if (!admin || admin.deletedAt) throw ApiError.invalidOTP();

    const isValidOTP = await validateEmailOTP(otp, email, OTPType.FORGOT_PASSWORD, false);
    if (!isValidOTP) throw ApiError.invalidOTP();

    await deleteMailOTP(otp, email, OTPType.FORGOT_PASSWORD);

    admin.password = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    admin.resetPasswordAt = new Date(); // Set reset timestamp to invalidate old tokens
    await admin.save();

    return res.JSON(HttpStatus.Ok);
  } catch (err) {
    next(err);
  }
}
