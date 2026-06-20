import { Express, ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { log } from '@/log';
import { ApiError } from '@/core/errors';
import { getI18Message } from '@server/utils/i18n';
import { ResponseTemplate } from '@server/types/server';

/**
 * Middleware to handle errors in the Express application.
 *
 * @param app - The Express application instance.
 *
 * This middleware captures any errors that occur during the request-response cycle
 * and formats them into a standardized JSON response. It logs the error message
 * and sends a response with the appropriate HTTP status code and error details.
 *
 * The error response follows the structure:
 * {
 *   status: 'error',
 *   error: {
 *     code: number,
 *     message: string
 *   }
 * }
 *
 * If the error does not have a specific code, it defaults to a 500 status code
 * and a generic error message.
 */
function errorMiddleware(app: Express) {
  const errorHandler: ErrorRequestHandler = async (err: ApiError, _: Request, res: Response, __: NextFunction) => {
    // Guard: err.code can be a Node.js system error string (e.g. 'EACCES') on non-ApiError instances.
    // Only use it as an HTTP status if it is a valid numeric HTTP status code.
    const rawCode = (err as any).code;
    const isValidHttpStatus = typeof rawCode === 'number' && Number.isFinite(rawCode) && rawCode >= 100 && rawCode <= 599;
    const code: number = isValidHttpStatus ? rawCode : 500;
    const isApiError = isValidHttpStatus && err instanceof Error && 'status' in err;
    const responseError: ResponseTemplate = {
      status: 'error',
      error: {
        code: code,
        message: isApiError ? err.message : getI18Message('somethingWentWrong'),
      },
    };
    log.error(err.message);
    res.status(code).json(responseError);
  };
  app.use(errorHandler);
}

export default errorMiddleware;
