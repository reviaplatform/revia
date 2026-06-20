import mongoose, { Document, Schema } from 'mongoose';

// Define the status enum
export enum CustomerStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  DELETED = 'deleted',
}

// Define the gender enum
export enum CustomerGender {
  MALE = 'male',
  FEMALE = 'female',
}

// Define the customer interface
export interface ICustomerDB extends Document {
  name: string;
  picture: string | null;
  status: CustomerStatus;
  phoneNumber: string;
  email: string | null;
  languagePreference: 'ar' | 'en';
  gender: CustomerGender;
  birthday: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  deletedAt: Date | null;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the customer schema
const customerSchema = new Schema<ICustomerDB>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      default: CustomerStatus.ACTIVE,
      enum: [CustomerStatus.ACTIVE, CustomerStatus.BANNED, CustomerStatus.DELETED],
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    languagePreference: {
      type: String,
      default: 'en',
      enum: ['en', 'ar'],
    },
    gender: {
      type: String,
      required: true,
      enum: [CustomerGender.MALE, CustomerGender.FEMALE],
    },
    birthday: {
      type: String,
      default: null,
    },
    location: {
      type: {
        latitude: {
          type: Number,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
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
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
customerSchema.index({ deletedAt: 1 });

// Create and export the model
const CustomerModel =
  mongoose.models.Customer || mongoose.model<ICustomerDB>('Customer', customerSchema);

export default CustomerModel;
