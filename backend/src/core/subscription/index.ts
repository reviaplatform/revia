import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { IBrandDB } from '@/database/models/brand';
import { IAdminDB } from '@/database/models/admin';
import BrandSubscriptionModel, { IBrandSubscriptionDB, SubscriptionStatus } from '@/database/models/brandSubscription';
import BrandSubscriptionConfigModel, { IBrandSubscriptionConfigDB } from '@/database/models/brandSubscriptionConfig';
import { SubscriptionConfigResult, SubscriptionResult } from './interfaces';

// ---------------------------------------------------------------------------
// Internal formatters
// ---------------------------------------------------------------------------
function _formatConfig(doc: IBrandSubscriptionConfigDB): SubscriptionConfigResult {
  return {
    priceEGP: doc.priceEGP,
    durationDays: doc.durationDays,
  };
}

function _formatSubscription(doc: IBrandSubscriptionDB & { brandId?: any }): SubscriptionResult {
  const brand = doc.brandId as any;
  return {
    id: doc._id!.toString(),
    brandId: typeof brand === 'object' && brand !== null ? brand._id.toString() : doc.brandId.toString(),
    brandName: typeof brand === 'object' && brand !== null ? brand.name : undefined,
    status: doc.status,
    price: doc.price,
    durationDays: doc.durationDays,
    activatedAt: doc.activatedAt ? converToTimeZone(doc.activatedAt) : null,
    expiresAt: doc.expiresAt ? converToTimeZone(doc.expiresAt) : null,
    createdAt: converToTimeZone(doc.createdAt),
    updatedAt: converToTimeZone(doc.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// Subscription config — singleton get-or-create
// ---------------------------------------------------------------------------
export async function getSubscriptionConfig(): AsyncSafeResult<SubscriptionConfigResult> {
  try {
    let config = await BrandSubscriptionConfigModel.findOne();
    if (!config) {
      config = await BrandSubscriptionConfigModel.create({ priceEGP: 999, durationDays: 365 });
    }
    return { result: _formatConfig(config), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

export async function updateSubscriptionConfig(
  admin: IAdminDB,
  priceEGP: number,
  durationDays: number,
): AsyncSafeResult<SubscriptionConfigResult> {
  try {
    const config = await BrandSubscriptionConfigModel.findOneAndUpdate(
      {},
      { priceEGP, durationDays, updatedBy: admin._id },
      { upsert: true, new: true },
    );
    return { result: _formatConfig(config!), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Brand requests a subscription
// ---------------------------------------------------------------------------
export async function requestSubscription(brand: IBrandDB): AsyncSafeResult<SubscriptionResult> {
  try {
    const existing = await BrandSubscriptionModel.findOne({
      brandId: brand._id,
      status: { $in: [SubscriptionStatus.PENDING_PAYMENT, SubscriptionStatus.ACTIVE] },
    });
    if (existing) throw ApiError.activeSubscriptionExists();

    const config = await BrandSubscriptionConfigModel.findOne();
    const priceEGP = config?.priceEGP ?? 999;
    const durationDays = config?.durationDays ?? 365;

    const sub = await BrandSubscriptionModel.create({
      brandId: brand._id,
      price: priceEGP,
      durationDays,
    });

    return { result: _formatSubscription(sub), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Brand gets their current subscription
// ---------------------------------------------------------------------------
export async function getMySubscription(brand: IBrandDB): AsyncSafeResult<SubscriptionResult | null> {
  try {
    const sub = await BrandSubscriptionModel.findOne({ brandId: brand._id }).sort('-createdAt');
    if (!sub) return { result: null, error: null };
    return { result: _formatSubscription(sub), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Admin: list subscriptions (optional status filter)
// ---------------------------------------------------------------------------
export async function adminListSubscriptions(
  status?: SubscriptionStatus,
): AsyncSafeResult<SubscriptionResult[]> {
  try {
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const subs = await BrandSubscriptionModel.find(filter)
      .populate('brandId', 'name')
      .sort('-createdAt');

    return { result: subs.map(_formatSubscription), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Admin: mark subscription as paid → ACTIVE
// ---------------------------------------------------------------------------
export async function adminMarkAsPaid(
  admin: IAdminDB,
  subscriptionId: string,
): AsyncSafeResult<SubscriptionResult> {
  try {
    const sub = await BrandSubscriptionModel.findById(subscriptionId);
    if (!sub) throw ApiError.notFoundSubscription();
    if (sub.status !== SubscriptionStatus.PENDING_PAYMENT) throw ApiError.subscriptionAlreadyActive();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + sub.durationDays * 24 * 60 * 60 * 1000);

    sub.status = SubscriptionStatus.ACTIVE;
    sub.activatedAt = now;
    sub.expiresAt = expiresAt;
    sub.markedPaidBy = admin._id as any;
    await sub.save();

    return { result: _formatSubscription(sub), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Check if brand has an active, non-expired subscription
// ---------------------------------------------------------------------------
export async function hasActiveSubscription(brandId: string): AsyncSafeResult<boolean> {
  try {
    const sub = await BrandSubscriptionModel.findOne({
      brandId,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
    });
    return { result: !!sub, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Cron: expire overdue active subscriptions
// ---------------------------------------------------------------------------
export async function expireOverdueSubscriptions(): AsyncSafeResult<number> {
  try {
    const result = await BrandSubscriptionModel.updateMany(
      { status: SubscriptionStatus.ACTIVE, expiresAt: { $lte: new Date() } },
      { $set: { status: SubscriptionStatus.EXPIRED } },
    );
    return { result: result.modifiedCount, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}
