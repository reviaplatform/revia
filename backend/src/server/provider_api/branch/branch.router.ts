import { Router } from 'express';
import * as branchController from './branch.controller';
import { providerIsAuth } from '@server/middleware/isAuth';
import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { changeLanguage } from '@server/middleware/language';
import { validateBody } from '@server/middleware/validate';
import { createBranchDataSchema, updateBranchDataSchema } from './branch.valid';

const router = Router();

// /api/v1/provider/branch/create
router.post(
  '/',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateBody(createBranchDataSchema),
  branchController.createNewBranch,
);

// /api/v1/provider/branch/:index/update
router.patch(
  '/:index/update',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateBody(updateBranchDataSchema),
  branchController.updateBranchData,
);

export default router;
