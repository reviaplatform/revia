import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { _formatUser, deleteCustomer, updateCustomer } from '@/core/account/customer';
import { ApiError, HttpStatus } from '@/core/errors';
import { CustomCustomerRequest } from '@server/middleware/isAuth';
import { ICustomerDB } from '@/database/models/customer';

export async function getMe(req: CustomCustomerRequest, res: Response, next: NextFunction) {
  try {
    const result = await _formatUser(req.user! as ICustomerDB);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function editMe(req: CustomCustomerRequest, res: Response, next: NextFunction) {
  try {
    const response = await updateCustomer(req.user!, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function deleteMe(req: CustomCustomerRequest, res: Response, next: NextFunction) {
  try {
    const response = await deleteCustomer(req.user!);
    if (response) throw new ApiError(response.message, HttpStatus.BadRequest);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}
