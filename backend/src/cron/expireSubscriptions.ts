import cron from 'node-cron';
import { expireOverdueSubscriptions } from '@/core/subscription';
import { log } from '../log';

export function startSubscriptionExpiryJob() {
  // Runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    const result = await expireOverdueSubscriptions();
    if (result.error) {
      log.error('[cron:expireSubscriptions] error:', result.error);
    } else if (result.result! > 0) {
      log.info(`[cron:expireSubscriptions] expired ${result.result} subscription(s)`);
    }
  });
}
