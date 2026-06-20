import * as http from 'node:http';
import path from 'node:path';
import express from 'express';
import { Server as ServerIo } from 'socket.io';
import Config from '@/config/env';
import { log } from '@/log';
import initAdminApi from './admin_api';
import initProviderApi from './provider_api';
import initApi from './api';
import initWebhook from './webhook/webhook.route';
import compression from './middleware/compression';
import cors from './middleware/cors';
import dataSanitize from './middleware/dataSanitize';
import errorMiddleware from './middleware/error';
import _404Middleware from './middleware/404';
import { JSONMiddleware } from './middleware/JSON';
import { logger } from './middleware/logger';
import { parseJsonMiddleware } from './middleware/parseJson';
import { securityHeader } from './middleware/securityHeader';
import helmet from './middleware/helmet';
import hpp from './middleware/hpp';
import { initSocket } from './websocket';
import { startSubscriptionExpiryJob } from '@/cron/expireSubscriptions';
import { startPickupReminderJob } from '@/cron/pickupReminder';
import { startCareReminderJob } from '@/cron/careReminder';

function initMiddleware(app: express.Express): void {
  // Middleware for compression
  compression(app);

  // Middleware for Cross-Origin Resource Sharing
  cors(app);

  // Middleware for data sanitization
  dataSanitize(app);

  // Middleware for security headers
  helmet(app);

  // Middleware to prevent HTTP Parameter Pollution
  hpp(app);

  // Middleware for JSON responses
  JSONMiddleware(app);

  // Middleware for logging
  logger(app);

  // Middleware for parsing JSON
  parseJsonMiddleware(app);

  // Middleware for security headers
  securityHeader(app);

  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
}

export function createServer(): express.Express {
  // Create express app
  const app = express();

  app.set('trust proxy', 1);

  const server = http.createServer(app);

  server.timeout = 30 * 60 * 1000; // 30 minutes (Max time for an active request)
  server.keepAliveTimeout = 60 * 1000; // 1 minute (Keep connection alive before closing)
  server.headersTimeout = 65 * 1000; // Slightly higher than keepAliveTimeout

  // Create and initialize socket server
  const io = new ServerIo(server, { cors: { origin: '*' } });
  app.set('io', io);

  initSocket(io);

  // Initialize Middleware
  initMiddleware(app);

  // Initialize API
  initAdminApi(app);
  initProviderApi(app);
  initApi(app);
  initWebhook(app);

  // Start background jobs
  startSubscriptionExpiryJob();
  startPickupReminderJob();
  startCareReminderJob();

  // Root route
  app.get('/', (_: express.Request, res: express.Response) => {
    res.json({});
  });

  // Initialize Error Middleware
  _404Middleware(app);
  errorMiddleware(app);

  // Start server
  server
    .listen(Config.PORT, () => {
      log.info(`Server created and listening on Port: ${Config.PORT}`);
    })
    .on('error', (error: Error) => {
      log.error(`[server] ${error.message}\n${error.stack ?? ''}`);
    });

  return app;
}
