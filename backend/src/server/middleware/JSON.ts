import { HttpStatus } from '@/core/errors';
import { wrapResponse } from '@server/utils/response';
import { NextFunction, Request, Response, Express } from 'express';

/**
 * Middleware to extend the Express response object with a custom JSON method.
 *
 * This middleware adds a `JSON` method to the response object, which allows
 * sending JSON responses with a specified HTTP status code and optional data.
 *
 * @param app - The Express application instance.
 *
 * Usage:
 * ```typescript
 * app.use(JSONMiddleware);
 *
 * // In a route handler
 * res.JSON(200, { message: 'Success' });
 * ```
 */
export function JSONMiddleware(app: Express) {
  app.use((_: Request, res: Response, next: NextFunction) => {
    res.JSON = (code: HttpStatus, data?: unknown) => {
      res.status(code).json(wrapResponse(data));
    };
    next();
  });
}

declare global {
  namespace Express {
    export interface Response {
      JSON: (code: HttpStatus, data?: unknown) => void;
    }
  }
}
