import crypto from 'crypto';
import Config from '@/config/env';
import { Request, Response } from 'express';
import { log } from '@/log';
import _ from 'underscore';
import { KashierWebhookEvent } from './interfaces';
import { PaymentStatus } from '@/database/models/payment';
import { updatePaymentStatus } from '@/core/payment';

export const handleKashierWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate the request signature
    const webhookEvent: KashierWebhookEvent = req.body;
    const kashierSignature = req.headers['x-kashier-signature'] as string;

    if (!kashierSignature) {
      log.warn('Kashier: Missing signature header');
      res.status(200).json({ status: 'ok' });
      return;
    }

    // Prepare signature payload
    const sortedSignatureKeys = [...webhookEvent.data.signatureKeys].sort();
    const signaturePayloadObj = _.pick(webhookEvent.data, sortedSignatureKeys);

    const queryString = (await import('query-string')).default;
    const signaturePayload = queryString.stringify(signaturePayloadObj, {
      encode: true,
      sort: false,
    });

    // Generate HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac('sha256', Config.KASHIER_API_KEY)
      .update(signaturePayload)
      .digest('hex');

    // Compare signatures securely
    if (!crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(kashierSignature))) {
      log.warn(`Kashier: Invalid signature for request: ${JSON.stringify(webhookEvent)}`);
      res.status(200).json({ status: 'ok' });
      return;
    }

    // 2. Check the transaction status
    const isSuccess = webhookEvent.data.status.toString() === 'SUCCESS';
    const isPending = webhookEvent.data.status.toString() === 'PENDING';
    const isRefunded = webhookEvent.event.toString() === 'refund';
    const isPay = webhookEvent.event.toString() === 'pay';
    const isVoid = webhookEvent.event.toString() === 'void';

    const payload = webhookEvent.data.merchantOrderId;
    const [paymentId] = payload.split('|');

    if (!paymentId) {
      log.error(`Kashier QB: Invalid merchantOrderId format: ${payload}`);
      res.status(200).json({ status: 'ok' });
      return;
    }

    if (isSuccess) {
      if (isRefunded) {
        await updatePaymentStatus(paymentId, PaymentStatus.REFUNDED);
      } else if (isPay) {
        await updatePaymentStatus(paymentId, PaymentStatus.PAID);
      } else if (isVoid) {
        await updatePaymentStatus(paymentId, PaymentStatus.REFUNDED);
      } else {
        log.warn(`Kashier QB: Unknown event for success ${paymentId}`);
      }
    } else if (isPending) {
      // Pending
    } else {
      log.warn(`Kashier QB: Transaction was not successful ${paymentId}`);
    }

    res.status(200).json({ status: 'ok' });
    return;
  } catch (error) {
    log.error(`Kashier QB: Error in handleWebhook:Req body: ${JSON.stringify(req.body)}`);
    res.status(200).json({ status: 'ok' });
    return;
  }
};