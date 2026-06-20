import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the device platform/OS enum
export enum DevicePlatform {
    IOS = 'ios',
    ANDROID = 'android',
    WINDOWS = 'windows',
    MACOS = 'macos',
    LINUX = 'linux',
    OTHER = 'other',
}

// Define the device interface
export interface IDeviceDB extends Document {
    customerId: Types.ObjectId;
    categoryId: Types.ObjectId;
    name: string;
    manufacturer: string;
    deviceModel: string;
    platform: DevicePlatform;
    osVersion: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Define the device schema
const deviceSchema = new Schema<IDeviceDB>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        deviceModel: {
            type: String,
            required: true,
            trim: true,
        },
        manufacturer: {
            type: String,
            required: true,
            trim: true,
        },
        platform: {
            type: String,
            required: true,
            enum: Object.values(DevicePlatform),
        },
        osVersion: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

// Indexes for better query performance
deviceSchema.index({ customerId: 1 });
deviceSchema.index({ categoryId: 1 });

// Create and export the model
const DeviceModel =
    mongoose.models.Device || mongoose.model<IDeviceDB>('Device', deviceSchema);

export default DeviceModel;
