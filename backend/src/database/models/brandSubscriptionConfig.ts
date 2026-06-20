import { ObjectId } from '@server/types/database';
import mongoose, { Document, Schema } from 'mongoose';

export interface IBrandSubscriptionConfigDB extends Document {
  priceEGP: number;
  durationDays: number;
  updatedBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const brandSubscriptionConfigSchema = new Schema<IBrandSubscriptionConfigDB>(
  {
    priceEGP: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    updatedBy: {
      type: ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true, strict: true },
);

const BrandSubscriptionConfigModel =
  mongoose.models.BrandSubscriptionConfig ||
  mongoose.model<IBrandSubscriptionConfigDB>('BrandSubscriptionConfig', brandSubscriptionConfigSchema);

export default BrandSubscriptionConfigModel;
