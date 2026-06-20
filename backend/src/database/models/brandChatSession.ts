import { ObjectId } from '@server/types/database';
import mongoose, { Document, Schema } from 'mongoose';
import { ChatRole, IChatMessage } from './chatSession';

export interface IBrandChatSessionDB extends Document {
  brandId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const brandChatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      required: true,
      enum: Object.values(ChatRole),
    },
    content: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['text', 'image', 'voice', 'system'],
      default: 'text',
    },
    mimetype: { type: String, required: false },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: false, strict: true },
);

const brandChatSessionSchema = new Schema<IBrandChatSessionDB>(
  {
    brandId: {
      type: ObjectId,
      ref: 'Brand',
      required: true,
    },
    providerId: {
      type: ObjectId,
      ref: 'Provider',
      required: true,
    },
    messages: {
      type: [brandChatMessageSchema],
      default: [],
    },
  },
  { timestamps: true, strict: true },
);

brandChatSessionSchema.index({ brandId: 1 });
brandChatSessionSchema.index({ providerId: 1 });
brandChatSessionSchema.index({ brandId: 1, providerId: 1 });

const BrandChatSessionModel =
  mongoose.models.BrandChatSession ||
  mongoose.model<IBrandChatSessionDB>('BrandChatSession', brandChatSessionSchema);

export default BrandChatSessionModel;
