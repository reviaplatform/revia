import cron from 'node-cron';
import { sendPickupReminders } from '@/core/repairRequest/reminder';
import { log } from '../log';

export function startPickupReminderJob() {
  // Runs once a day; the ~3-month spacing per request is enforced by the
  // pickupReminderSentAt comparison inside sendPickupReminders, not by this interval.
  cron.schedule('0 3 * * *', async () => {
    const result = await sendPickupReminders();
    if (result.error) {
      log.error('[cron:pickupReminder] error:', result.error);
    } else if (result.result! > 0) {
      log.info(`[cron:pickupReminder] sent ${result.result} reminder(s)`);
    }
  });
}
