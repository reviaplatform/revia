import { HttpStatus } from '@/core/errors';
import { Express, Request, Response, NextFunction } from 'express';

/**
 * Middleware function to enable Cross-Origin Resource Sharing (CORS) for the Express application.
 *
 * This function sets the necessary headers to allow cross-origin requests from any origin.
 * It allows all HTTP methods and all headers to be sent in the request.
 *
 * If the request method is OPTIONS, it responds with a status of 204 (No Content) and ends the request.
 * Otherwise, it passes control to the next middleware function.
 *
 * @param {Express} app - The Express application instance.
 */
function cors(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin || '*';
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    const headers = req.headers['access-control-request-headers'] || '*';
    res.set('Access-Control-Allow-Headers', headers);
    res.set('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.sendStatus(HttpStatus.NoContent);
      return;
    }
    next();
  });
}

export default cors;
