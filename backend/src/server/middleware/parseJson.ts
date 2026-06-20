import express from 'express';

/**
 * Middleware to parse large JSON requests (up to 1 GB).
 *
 * This middleware increases the default body size limit from 100KB
 * to 1GB, allowing large JSON payloads for file metadata, video info, etc.
 *
 * @param app - The Express app instance.
 */
export function parseJsonMiddleware(app: express.Express) {
  app.use(express.json({ limit: '1gb' }));
  app.use(express.urlencoded({ extended: true, limit: '1gb' }));
}
