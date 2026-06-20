import cron from 'node-cron';
import { sendCareReminders } from '@/core/repairRequest/reminder';
import { log } from '../log';

export function startCareReminderJob() {
  // Runs once a day; the ~3-month spacing per request is enforced by the
  // careEmailSentAt comparison inside sendCareReminders, not by this interval.
  cron.schedule('0 4 * * *', async () => {
    const result = await sendCareReminders();
    if (result.error) {
      log.error('[cron:careReminder] error:', result.error);
    } else if (result.result! > 0) {
      log.info(`[cron:careReminder] sent ${result.result} care email(s)`);
    }
  });
}
