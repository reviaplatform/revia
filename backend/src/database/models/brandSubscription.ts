import { ObjectId } from '@server/types/database';
import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export interface IBrandSubscriptionDB extends Document {
  brandId: mongoose.Types.ObjectId;
  status: SubscriptionStatus;
  price: number;
  durationDays: number;
  activatedAt: Date | null;
  expiresAt: Date | null;
  markedPaidBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const brandSubscriptionSchema = new Schema<IBrandSubscriptionDB>(
  {
    brandId: {
      type: ObjectId,
      ref: 'Brand',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.PENDING_PAYMENT,
    },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    activatedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    markedPaidBy: {
      type: ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true, strict: true },
);

brandSubscriptionSchema.index({ brandId: 1, status: 1 });
brandSubscriptionSchema.index({ status: 1, expiresAt: 1 });

const BrandSubscriptionModel =
  mongoose.models.BrandSubscription ||
  mongoose.model<IBrandSubscriptionDB>('BrandSubscription', brandSubscriptionSchema);

export default BrandSubscriptionModel;
