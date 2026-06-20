import { Router } from 'express';
import * as authController from './auth.controller';
import { validateBody } from '@server/middleware/validate';
import {
  forgotPasswordSchema,
  providerLoginSchema,
  providerSignupSchema,
  resetPasswordSchema,
  verifyOTPSchema,
} from './auth.valid';
import {
  providerDashboardLoginlimiter,
  providerDashboardForgotPasswordlimiter,
} from '@server/utils/rateLimit';
import { uploadSingleData } from '@server/middleware/multer';
import { uploadBrandImage } from '@server/middleware/imageProcessing';

const router = Router();

// /api/v1/provider/auth/login
router.post(
  '/login',
  providerDashboardLoginlimiter,
  validateBody(providerLoginSchema),
  authController.login,
);

// /api/v1/provider/auth/signup
router.post(
  '/signup',
  providerDashboardLoginlimiter,
  uploadSingleData('logo'),
  uploadBrandImage,
  validateBody(providerSignupSchema),
  authController.signup,
);

// /api/v1/provider/auth/forgot-password
router.post(
  '/forgot-password',
  providerDashboardForgotPasswordlimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);

// /api/v1/provider/auth/verify-password-otp
router.post(
  '/verify-password-otp',
  providerDashboardForgotPasswordlimiter,
  validateBody(verifyOTPSchema),
  authController.verifyPasswordOTP,
);

// /api/v1/provider/auth/reset-password
router.post(
  '/reset-password',
  providerDashboardForgotPasswordlimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
