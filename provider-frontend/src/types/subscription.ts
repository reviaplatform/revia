export type SubscriptionStatus = 'pending_payment' | 'active' | 'expired';

export interface Subscription {
  id: string;
  brandId: string;
  status: SubscriptionStatus;
  price: number;
  durationDays: number;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingInfo {
  priceEGP: number;
  durationDays: number;
}
