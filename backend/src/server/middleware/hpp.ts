import { Express } from 'express';
import h from 'hpp';

/**
 * Middleware function to protect against HTTP Parameter Pollution (HPP).
 *
 * This function adds the HPP middleware to the provided Express application instance.
 * HPP is a security measure that prevents attackers from exploiting the same parameter
 * multiple times in a query string, which can lead to unexpected behavior or vulnerabilities.
 *
 * @param app - The Express application instance to which the HPP middleware will be added.
 */
function hpp(app: Express) {
  app.use(h());
}

export default hpp;
