import Config, { Env } from '@/config/env';
import { logRequest, logResponse } from '@/log';
import express from 'express';

/**
 * Middleware function to log HTTP requests and responses.
 *
 * @param app - The Express application instance.
 *
 * This middleware logs the HTTP method, request path, client IP address (or '[RESTRICTED]' in non-production environments),
 * and user-agent of incoming requests. It also logs the HTTP method, request path, response status code, and response time
 * in milliseconds for outgoing responses.
 *
 * The logging functions `logRequest` and `logResponse` are used to record the relevant information.
 */
export function logger(app: express.Express) {
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const end = res.end;
    const path = req.path;
    const method = req.method;
    const msStart = new Date().getTime();
    logRequest(
      method,
      path,
      Config.NODE_ENV == Env.PRODUCTION ? req.ip || 'UNKNOWN_IP' : '[RESTRICTED]',
      req.get('user-agent') || '',
    );

    res.end = function (...d: any) {
      logResponse(method, path, res.statusCode, new Date().getTime() - msStart);
      res.end = end;
      return res.end(...d);
    };
    next();
  });
}
