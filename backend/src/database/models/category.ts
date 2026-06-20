import { lang } from '@/core/types';
import mongoose, { Document, Schema } from 'mongoose';

// Define the category interface
export interface ICategoryDB extends Document {
  name: lang;
  /** Platform commission as a percentage (0-100) of the payment amount */
  commissionPerRequest: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the category schema
const categorySchema = new Schema<ICategoryDB>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
      _id: false,
    },
    commissionPerRequest: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Create and export the model
const CategoryModel = mongoose.model<ICategoryDB>('Category', categorySchema);

export default CategoryModel;
