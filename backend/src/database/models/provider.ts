import { ObjectId } from '@server/types/database';
import mongoose, { Schema, Document } from 'mongoose';

export enum ProviderRole {
  OWNER = 'owner',
}

export interface IProviderDB extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  deletedAt: Date | null;
  role: ProviderRole;
  brandId: mongoose.Types.ObjectId;
  languagePreference: 'en' | 'ar';
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordAt: Date;
}

const providerSchema = new Schema<IProviderDB>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: [ProviderRole.OWNER],
      required: true,
    },
    brandId: {
      type: ObjectId,
      ref: 'Brand',
      required: true,
    },
    languagePreference: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en',
    },
    lastLoginAt: {
      type: Date,
      default: new Date(),
    },
    resetPasswordAt: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true, strict: true },
);

providerSchema.index({ name: 1 });
providerSchema.index({ email: 1 });

const ProviderModel =
  mongoose.models.Provider || mongoose.model<IProviderDB>('Provider', providerSchema);

export default ProviderModel;
