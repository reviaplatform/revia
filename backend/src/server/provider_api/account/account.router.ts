import { providerBrandIsBanned, providerIsBanned } from '@server/middleware/isBanned';
import { providerIsAuth } from '@server/middleware/isAuth';
import { Router } from 'express';
import * as accountController from './account.controller';
import { querySchema } from '@server/utils/validate';
import { changeLanguage } from '@server/middleware/language';
import { validateBody, validateQuery } from '@server/middleware/validate';
import { createProviderDataSchema, updateProviderDataSchema } from './account.valid';

const router = Router();

// /api/v1/provider/account/list
router.get(
  '/list',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateQuery(querySchema),
  accountController.getProviderList,
);

// /api/v1/provider/account/create
router.post(
  '/create',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateBody(createProviderDataSchema),
  accountController.createNewProvider,
);

// /api/v1/provider/account/:id/update
router.put(
  '/:id/update',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  validateBody(updateProviderDataSchema),
  accountController.updateProviderData,
);

// /api/v1/provider/account/:id/ban
router.delete(
  '/:id/ban',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  accountController.banProvider,
);

// /api/v1/provider/account/:id/unban
router.post(
  '/:id/unban',
  providerIsAuth,
  providerIsBanned,
  providerBrandIsBanned,
  changeLanguage,
  accountController.unbanProvider,
);

export default router;
