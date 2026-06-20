import mongoose, { Document, Schema } from 'mongoose';

// Define the roles enum
export enum AdminRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
}

// Define the admin interface
export interface IAdminDB extends Document {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  languagePreference: 'ar' | 'en';
  role: AdminRole;
  lastLoginAt: Date;
  deletedAt: Date | null;
  resetPasswordAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the admin schema
const adminSchema = new Schema<IAdminDB>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    languagePreference: {
      type: String,
      default: 'en',
      enum: ['en', 'ar'],
    },
    role: {
      type: String,
      required: true,
      enum: [AdminRole.ADMIN, AdminRole.MANAGER],
    },
    lastLoginAt: {
      type: Date,
      default: new Date(),
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    resetPasswordAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Create indexes for better query performance
// Note: email and phoneNumber indexes are handled by unique:true above
adminSchema.index({ role: 1 });

// Create and export the model
const AdminModel = mongoose.model<IAdminDB>('Admin', adminSchema);

export default AdminModel;
