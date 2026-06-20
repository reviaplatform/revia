import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { ApiError, HttpStatus } from '@/core/errors';
import { _formatAdmin, updateAdmin } from '@/core/account/admin';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import bcrypt from 'bcrypt';

export async function getMe(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {

    const result = _formatAdmin(req.admin!);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await updateAdmin(req.adminId!, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function updateMePassword(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const { oldPassword, newPassword, confNewPassword } = req.body;

    if (newPassword != confNewPassword) throw ApiError.notMatchPassword();

    const validPass = await bcrypt.compare(oldPassword, req.admin!.password);
    if (!validPass) throw ApiError.invalidOldPassword();

    req.body.password = newPassword;
    req.body.resetPasswordAt = new Date(); // Set reset timestamp to invalidate old tokens
    const response = await updateAdmin(req.adminId!, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
