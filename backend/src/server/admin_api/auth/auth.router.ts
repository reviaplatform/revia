import { Router } from 'express';
import * as authController from './auth.controller';
import { validateBody } from '@server/middleware/validate';
import {
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
} from './auth.valid';
import {
  adminDashboardLoginlimiter,
  adminDashboardForgotPasswordlimiter,
} from '@server/utils/rateLimit';

const router = Router();

// /api/v1/admin/auth/login
router.post(
  '/login',
  adminDashboardLoginlimiter,
  validateBody(adminLoginSchema),
  authController.login,
);

// /api/v1/admin/auth/forgot-password
router.post(
  '/forgot-password',
  adminDashboardForgotPasswordlimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);

// /api/v1/admin/auth/verify-password-otp
router.post(
  '/verify-password-otp',
  adminDashboardForgotPasswordlimiter,
  validateBody(verifyOTPSchema),
  authController.verifyPasswordOTP,
);

// /api/v1/admin/auth/reset-password
router.post(
  '/reset-password',
  adminDashboardForgotPasswordlimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
