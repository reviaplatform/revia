import { Express } from 'express';
import { ApiError, HttpStatus } from '@/core/errors';

/**
 * Middleware to handle 404 Not Found errors.
 *
 * This middleware should be used to catch all requests to endpoints that do not exist.
 * It throws an `ApiError` with a message indicating that the endpoint was not found
 * and sets the HTTP status code to 404 (Not Found).
 *
 * @param app - The Express application instance.
 */
function _404Middleware(app: Express) {
  app.use(() => {
    throw new ApiError('EndPoint Not Found!', HttpStatus.NotFound);
  });
}

export default _404Middleware;
