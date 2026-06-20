import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { ApiError, HttpStatus } from '@/core/errors';
import { validateId } from '@server/types/database';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import {
  createAdmin,
  getAdmin,
  getAllAdmins,
  updateAdmin,
  banAdmin as ba,
  unBanAdmin as unba,
} from '@/core/account/admin';
import {
  getAllCustomers,
  getCustomer,
  banCustomer as bc,
  unBanCustomer as unbc,
  restoreCustomer,
} from '@/core/account/customer';
import { getAllProviders } from '@/core/account/provider';

export async function getAdminList(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await getAllAdmins(req.query, req.adminId!);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function getSingleAdmin(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await getAdmin(id);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function createNewAdmin(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await createAdmin(req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Created, result);
  } catch (err) {
    next(err);
  }
}

export async function updateAdminData(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await updateAdmin(id, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function banAdmin(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await ba(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function unbanAdmin(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await unba(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerList(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await getAllCustomers(req.query);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function getSingleCustomer(
  req: CustomAdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await getCustomer(id);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function banCustomer(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await bc(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function unbanCustomer(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await unbc(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function restoreCustomerAccount(
  req: CustomAdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!validateId(id)) throw ApiError.notFoundAdmin();

    const response = await restoreCustomer(id);
    if (response) throw new ApiError(response.message, response.code);

    res.JSON(HttpStatus.Ok, null);
  } catch (err) {
    next(err);
  }
}

export async function getProviderList(req: CustomAdminRequest, res: Response, next: NextFunction) {
  try {
    const response = await getAllProviders(req.query);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
