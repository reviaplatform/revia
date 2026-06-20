import { ObjectId } from '@server/types/database';
import mongoose, { Document, Schema } from 'mongoose';

export interface IReelLikeDB extends Document {
  reel: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  createdAt: Date;
}

const reelLikeSchema = new Schema<IReelLikeDB>(
  {
    reel: {
      type: ObjectId,
      ref: 'Reel',
      required: true,
    },
    customer: {
      type: ObjectId,
      ref: 'Customer',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    strict: true,
  },
);

// Indexes
reelLikeSchema.index({ reel: 1, customer: 1 }, { unique: true });
reelLikeSchema.index({ customer: 1 });

const ReelLikeModel =
  mongoose.models.ReelLike || mongoose.model<IReelLikeDB>('ReelLike', reelLikeSchema);

export default ReelLikeModel;
