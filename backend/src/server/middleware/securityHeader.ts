import { Express, NextFunction, Request, Response } from 'express';

/**
 * Configures security-related HTTP headers for the Express application.
 *
 * This function disables the 'X-Powered-By' header to hide information about the Express framework.
 * It also sets the 'Referrer-Policy' header to 'no-referrer' to prevent referrer leakage.
 *
 * @param app - The Express application instance to configure.
 */
export function securityHeader(app: Express) {
  // Disable 'X-Powered-By' to hide Express framework information
  app.disable('x-powered-by');

  app.use((_: Request, res: Response, next: NextFunction) => {
    // Helmet already sets other headers

    // Control referrer information to prevent referrer leakage
    res.setHeader('Referrer-Policy', 'no-referrer');

    next();
  });
}
