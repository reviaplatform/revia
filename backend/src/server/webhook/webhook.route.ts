import { Router } from 'express';
import { handleKashierWebhook } from './webhook.controller';
import { InitRouterFunc } from '@server/types/server';

const router = Router();

// POST /api/v1/webhook/kashier/payment-webhook
router.post('/webhook/kashier/payment-webhook', handleKashierWebhook);

const initWebhook: InitRouterFunc = app => {
  // /api/v1/webhook/kashier/payment-webhook
  app.use('/api/v1', router);
};

export default initWebhook;
