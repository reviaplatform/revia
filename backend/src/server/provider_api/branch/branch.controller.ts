import { _formatBrandInProvider, addBranch, updateBranch } from '@/core/brand';
import { ApiError, HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';

export async function createNewBranch(
  req: CustomProviderRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await addBranch(req.brand!, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}

export async function updateBranchData(
  req: CustomProviderRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const rawBranchIndex = req.params.index as string;
    const branchIndex = parseInt(rawBranchIndex ?? '', 10);

    // Validate branch index
    if (Number.isNaN(branchIndex) || branchIndex < 0 || branchIndex >= req.brand!.branches.length) {
      throw ApiError.invalidBranchIndex();
    }

    const response = await updateBranch(req.brand!, branchIndex, req.body);

    const result = unwrapResult(response);

    res.JSON(HttpStatus.Ok, result);
  } catch (err) {
    next(err);
  }
}
