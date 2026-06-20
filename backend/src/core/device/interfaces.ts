import { DevicePlatform } from '@/database/models/device';

export interface DeviceData {
    categoryId: string; // references Category (phone, laptop, etc.)
    name: string;
    manufacturer: string;
    deviceModel: string;
    platform: DevicePlatform;
    osVersion?: string;
}

export interface DeviceResult {
    id?: string;
    customerId?: string;
    category?: {
        id: string;
        name: { en: string; ar: string };
    } | null;
    name: string;
    manufacturer: string;
    deviceModel: string;
    platform: DevicePlatform;
    osVersion: string | null;
    createdAt?: string;
}
