import { Router } from 'express';
import * as authController from './auth.controller';
import { register } from '@server/middleware/isAuth';
import { validateBody } from '@server/middleware/validate';
import {
  sendOTPSchema,
  userAuthSignupSchema,
  validateOTPSchemae,
  validateOTPSchemane,
} from './auth.valid';
import { appLoginAndRegisterLimiter } from '@server/utils/rateLimit';

const router = Router();

// /api/v1/auth/send-otp
router.post(
  '/send-otp',
  appLoginAndRegisterLimiter,
  validateBody(sendOTPSchema),
  authController.sendOTP,
);

// /api/v1/auth/validate-exist-user-otp
router.post(
  '/validate-exist-user-otp',
  appLoginAndRegisterLimiter,
  validateBody(validateOTPSchemae),
  authController.validateExistUserOTP,
);

// /api/v1/auth/validate-notexist-user-otp
router.post(
  '/validate-notexist-user-otp',
  appLoginAndRegisterLimiter,
  validateBody(validateOTPSchemane),
  authController.validateNotExistUserOTP,
);

// /api/v1/auth/register
router.post(
  '/register',
  appLoginAndRegisterLimiter,
  register,
  validateBody(userAuthSignupSchema),
  authController.register,
);

// /api/v1/auth/refresh
router.get('/refresh', appLoginAndRegisterLimiter, authController.refresh);

export default router;
