import Config, { Env } from '@/config/env';
import { ApiError } from '@/core/errors';
import rateLimit from 'express-rate-limit';

const isDevelopment = Config.NODE_ENV.toString() !== Env.PRODUCTION.toString();

function getRateLimitMax(defaultValue: number, devNumber: number): number {
  return isDevelopment ? devNumber : defaultValue;
}

// Rate limiter for login and registration endpoints
export const appLoginAndRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getRateLimitMax(10, 100), // Limit each IP to 10 requests per window (15 minutes)
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (_, __, next, ___) => next(ApiError.rateLimitExceeded()), // Custom handler for rate limit exceeded
});


// Rate limiter for admin dashboard login endpoint
export const adminDashboardLoginlimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getRateLimitMax(10, 100), // Limit each IP to 10 requests per window (15 minutes)
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (_, __, next, ___) => next(ApiError.rateLimitExceeded()), // Custom handler for rate limit exceeded
});

// Rate limiter for admin dashboard forgot password endpoint
export const adminDashboardForgotPasswordlimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getRateLimitMax(10, 100), // Limit each IP to 10 requests per window (15 minutes)
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (_, __, next, ___) => next(ApiError.passwordResetRateLimit()), // Custom handler for rate limit exceeded
});

// Rate limiter for provider dashboard login endpoint
export const providerDashboardLoginlimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getRateLimitMax(10, 100), // Limit each IP to 10 requests per window (15 minutes)
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (_, __, next, ___) => next(ApiError.loginRateLimit()), // Custom handler for rate limit exceeded
});

// Rate limiter for provider dashboard signup endpoint
export const providerDashboardSignuplimiter = rateLimit({
  windowMs: 600 * 60 * 1000, // 600 minutes
  max: getRateLimitMax(10, 100), // Limit each IP to 10 requests per window (600 minutes)
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (_, __, next, ___) => next(ApiError.signupRateLimit()), // Custom handler for rate limit exceeded
});

// Rate limiter for provider dashboard forgot password endpoint
export const providerDashboardForgotPasswordlimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getRateLimitMax(10, 50), // Limit each IP to 10 requests per window (15 minutes)
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (_, __, next, ___) => next(ApiError.passwordResetRateLimit()), // Custom handler for rate limit exceeded
});
