export interface SubscriptionConfigResult {
  priceEGP: number;
  durationDays: number;
}

export interface SubscriptionResult {
  id: string;
  brandId: string;
  status: string;
  price: number;
  durationDays: number;
  activatedAt: string | null;
  expiresAt: string | null;
  brandName?: { en: string; ar: string };
  createdAt: string;
  updatedAt: string;
}
