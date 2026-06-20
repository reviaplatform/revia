import { AsyncSafeResult } from '@/core/types';
import { log } from '@/log';
import EmailServices from '@/core/utils/email';
import CustomerModel from '@/database/models/customer';
import DeviceModel from '@/database/models/device';
import RepairRequestModel, { RepairRequestStatus } from '@/database/models/repairRequest';

const REMINDER_INTERVAL_MS = 90 * 24 * 60 * 60 * 1000; // ~3 months

// ---------------------------------------------------------------------------
// Re-notify customers whose device has been awaiting pickup for ~3 months
// ---------------------------------------------------------------------------
export async function sendPickupReminders(): AsyncSafeResult<number> {
  try {
    const dueBefore = new Date(Date.now() - REMINDER_INTERVAL_MS);

    const requests = await RepairRequestModel.find({
      status: RepairRequestStatus.PENDING_USER_DEVICE_PICKUP,
      pickupReminderSentAt: { $lte: dueBefore },
    });

    let sentCount = 0;

    for (const req of requests) {
      try {
        const customer = await CustomerModel.findById(req.customerId);
        if (!customer?.email) continue;

        const device = await DeviceModel.findById(req.deviceId);
        const deviceName = device?.name ?? 'device';

        await EmailServices.sendDeviceReadyForPickup(customer.email, deviceName);
        req.pickupReminderSentAt = new Date();
        await req.save();
        sentCount++;
      } catch (err) {
        log.error(`[repairRequest:reminder] failed to send reminder for request ${req._id}:`, err);
      }
    }

    return { result: sentCount, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Re-notify customers of completed repairs with a "care" check-in every ~3 months
// ---------------------------------------------------------------------------
export async function sendCareReminders(): AsyncSafeResult<number> {
  try {
    const dueBefore = new Date(Date.now() - REMINDER_INTERVAL_MS);

    const requests = await RepairRequestModel.find({
      status: RepairRequestStatus.COMPLETED,
      careEmailSentAt: { $lte: dueBefore },
    });

    let sentCount = 0;

    for (const req of requests) {
      try {
        const customer = await CustomerModel.findById(req.customerId);
        if (!customer?.email) continue;

        const device = await DeviceModel.findById(req.deviceId);
        const deviceName = device?.name ?? 'device';

        await EmailServices.sendCareCheckIn(customer.email, deviceName);
        req.careEmailSentAt = new Date();
        await req.save();
        sentCount++;
      } catch (err) {
        log.error(`[repairRequest:reminder] failed to send care email for request ${req._id}:`, err);
      }
    }

    return { result: sentCount, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}
