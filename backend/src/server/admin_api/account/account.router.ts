import { adminIsBanned } from '@server/middleware/isBanned';
import { adminAllowedTo, adminIsAuth } from '@server/middleware/isAuth';
import { AdminRole } from '@/database/models/admin';
import { Router } from 'express';
import * as accountController from './account.controller';
import { querySchema } from '@server/utils/validate';
import { createAdminDataSchema, updateAdminDataSchema } from './account.valid';
import { changeLanguage } from '@server/middleware/language';
import { validateBody, validateQuery } from '@server/middleware/validate';

const router = Router();

// /api/v1/admin/account/admin-list
router.get(
  '/admin-list',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  validateQuery(querySchema),
  accountController.getAdminList,
);

// /api/v1/admin/account/:id/admin
router.get(
  '/:id/admin',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  validateQuery(querySchema),
  accountController.getSingleAdmin,
);

// /api/v1/admin/account/create-admin
router.post(
  '/create-admin',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  validateBody(createAdminDataSchema),
  accountController.createNewAdmin,
);

// /api/v1/admin/acc/:id/update-admin
router.put(
  '/:id/update-admin',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  validateBody(updateAdminDataSchema),
  accountController.updateAdminData,
);

// /api/v1/admin/acc/:id/ban-admin
router.delete(
  '/:id/ban-admin',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  accountController.banAdmin,
);

// /api/v1/admin/acc/:id/unban-admin
router.post(
  '/:id/unban-admin',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN),
  accountController.unbanAdmin,
);

// /api/v1/admin/account/customer-list
router.get(
  '/customer-list',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  accountController.getCustomerList,
);

// /api/v1/admin/account/:id/customer
router.get(
  '/:id/customer',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  accountController.getSingleCustomer,
);

// /api/v1/admin/acc/:id/ban-customer
router.delete(
  '/:id/ban-customer',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  accountController.banCustomer,
);

// /api/v1/admin/acc/:id/unban-customer
router.post(
  '/:id/unban-customer',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  accountController.unbanCustomer,
);

// /api/v1/admin/acc/:id/restore-customer
router.post(
  '/:id/restore-customer',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  accountController.restoreCustomerAccount,
);

// /api/v1/admin/account/provider-list
router.get(
  '/provider-list',
  adminIsAuth,
  adminIsBanned,
  changeLanguage,
  adminAllowedTo(AdminRole.ADMIN, AdminRole.MANAGER),
  validateQuery(querySchema),
  accountController.getProviderList,
);

export default router;
