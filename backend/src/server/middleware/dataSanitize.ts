import { Express } from 'express';
import mongosanitize from 'express-mongo-sanitize';

/**
 * Middleware function to sanitize data in the Express application.
 *
 * This function applies the `mongosanitize` middleware to the provided Express app,
 * which helps prevent MongoDB Operator Injection by removing any MongoDB operators
 * from the input data.
 *
 * @param app - The Express application instance to which the middleware will be applied.
 */
function dataSanitize(app: Express) {
  app.use(mongosanitize({ replaceWith: '' }));
}

export default dataSanitize;
