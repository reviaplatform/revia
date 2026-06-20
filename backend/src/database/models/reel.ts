import { lang } from '@/core/types';
import { ObjectId } from '@server/types/database';
import mongoose, { Document, Schema } from 'mongoose';

export interface IReelDB extends Document {
  brand: mongoose.Types.ObjectId;
  video: string; // Storage key for the video
  thumbnail: string; // Storage key for the thumbnail
  caption: lang;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  isVisible: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reelSchema = new Schema<IReelDB>(
  {
    brand: {
      type: ObjectId,
      ref: 'Brand',
      required: true,
    },
    video: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    tags: {
      type: [String],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Indexes
reelSchema.index({ brand: 1 });
reelSchema.index({ isVisible: 1 });
reelSchema.index({ deletedAt: 1 });
reelSchema.index({ createdAt: -1 });

const ReelModel = mongoose.models.Reel || mongoose.model<IReelDB>('Reel', reelSchema);

export default ReelModel;
