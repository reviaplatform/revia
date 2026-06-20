import { Express } from 'express';
import c from 'compression';

/**
 * Applies compression middleware to the provided Express application instance.
 *
 * This function adds compression to the Express app, which helps in reducing the size of the response body
 * and hence improves the performance of the application by decreasing the amount of data transmitted over the network.
 *
 * @param app - The Express application instance to which the compression middleware will be applied.
 */
function compression(app: Express) {
  app.use(c());
}

export default compression;
