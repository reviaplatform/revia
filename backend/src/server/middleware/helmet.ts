import { Express } from 'express';
import h from 'helmet';

/**
 * Middleware function to set up Helmet for enhancing the security of the Express application.
 * Helmet helps secure the app by setting various HTTP headers.
 *
 * @param app - The Express application instance.
 */
function helmet(app: Express) {
  app.use(
    h({
      crossOriginResourcePolicy: false, // Allows cross-origin requests by removing CORP header
    })
  );
}

export default helmet;
