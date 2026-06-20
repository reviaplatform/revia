import { lang, locationData } from '@/core/types';
import { ObjectId } from '@server/types/database';
import mongoose, { Document, Schema } from 'mongoose';

// Branch subdocument interface
export interface IBranch {
  name: lang;
  location: locationData;
  isActive: boolean;
}

// Brand interface
export interface IBrandDB extends Document {
  logo: string;
  name: lang;
  crn: string;
  tin: string;
  categories: mongoose.Types.ObjectId[];
  branches: IBranch[];
  tags: string[];
  allowPayUsePOS: boolean;
  completedRepairs: number;
  rating: number;
  ratingCount: number;
  /**
   * Current available payout balance (EGP).
   * Credited when a booking payment is finalised (brandNet).
   * Debited when the platform marks a payout request as "sent".
   */
  lockedBalance: number;
  walletBalance: number;
  approvedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
      _id: false,
    },
    location: {
      type: {
        longitude: { type: Number, required: true, min: -180, max: 180 },
        latitude: { type: Number, required: true, min: -90, max: 90 },
      },
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: false, strict: true },
);

const brandSchema = new Schema<IBrandDB>(
  {
    logo: { type: String, required: true, trim: true },
    name: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
      _id: false,
    },
    crn: { type: String, required: true, trim: true },
    tin: { type: String, required: true, trim: true },
    categories: [
      {
        type: ObjectId,
        ref: 'Category',
      },
    ],
    branches: {
      type: [branchSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    allowPayUsePOS: { type: Boolean, required: true },
    completedRepairs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    approvedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Indexes
brandSchema.index({ categories: 1 });
brandSchema.index({ deletedAt: 1 });
brandSchema.index({ 'branches.location.longitude': 1, 'branches.location.latitude': 1 });

const BrandModel = mongoose.models.Brand || mongoose.model<IBrandDB>('Brand', brandSchema);

export default BrandModel;
