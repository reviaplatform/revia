import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import DeviceModel, { IDeviceDB } from '@/database/models/device';
import { ICustomerDB } from '@/database/models/customer';
import { ICategoryDB } from '@/database/models/category';
import { converToTimeZone } from '@/core/utils/functions';
import { DeviceData, DeviceResult } from './interfaces';
import CategoryModel from '@/database/models/category';

/**
 * Register a new device for the authenticated customer.
 * (app api)
 */
export async function registerDevice(
    customer: ICustomerDB,
    data: DeviceData,
): AsyncSafeResult<DeviceResult> {
    try {
        const category = await CategoryModel.findById(data.categoryId);
        if (!category) throw ApiError.notFoundCategory();

        const device = await DeviceModel.create({
            customerId: customer._id,
            categoryId: data.categoryId,
            name: data.name,
            platform: data.platform,
            deviceModel: data.deviceModel,
            manufacturer: data.manufacturer,
            osVersion: data.osVersion ?? null,
        });

        // Re-fetch with populated category so the formatter has the data
        const populated = await DeviceModel.findById(device._id).populate('categoryId');

        return { result: _formatDevice(populated!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

/**
 * Get all devices belonging to the authenticated customer.
 * (app api)
 */
export async function getCustomerDevices(
    customer: ICustomerDB,
): AsyncSafeResult<DeviceResult[]> {
    try {
        const devices = await DeviceModel.find({ customerId: customer._id })
            .populate('categoryId')
            .sort('-createdAt');

        return { result: devices.map(_formatDevice), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

/**
 * Get a single device by ID (must belong to authenticated customer).
 * (app api)
 */
export async function getDevice(
    customer: ICustomerDB,
    deviceId: string,
): AsyncSafeResult<DeviceResult> {
    try {
        const device = await DeviceModel.findOne({ _id: deviceId, customerId: customer._id }).populate(
            'categoryId',
        );
        if (!device) throw ApiError.notFoundDevice();

        return { result: _formatDevice(device), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

/**
 * Update an existing device (must belong to authenticated customer).
 * (app api)
 */
export async function updateDevice(
    customer: ICustomerDB,
    deviceId: string,
    data: Partial<DeviceData>,
): AsyncSafeResult<DeviceResult> {
    try {
        const device = await DeviceModel.findOne({ _id: deviceId, customerId: customer._id });
        if (!device) throw ApiError.notFoundDevice();

        if (data.categoryId) {
            const category = await CategoryModel.findById(data.categoryId);
            if (!category) throw ApiError.notFoundCategory();
        }

        Object.assign(device, {
            ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.platform !== undefined && { platform: data.platform }),
            ...(data.deviceModel !== undefined && { deviceModel: data.deviceModel }),
            ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
            ...(data.osVersion !== undefined && { osVersion: data.osVersion }),
        });

        await device.save();

        const populated = await DeviceModel.findById(device._id).populate('categoryId');

        return { result: _formatDevice(populated!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

/**
 * Admin: get all devices for a specific customer.
 * (admin api)
 */
export async function adminGetCustomerDevices(
    customerId: string,
): AsyncSafeResult<DeviceResult[]> {
    try {
        const devices = await DeviceModel.find({ customerId }).populate('categoryId').sort('-createdAt');

        return { result: devices.map(_formatDevice), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export function _formatDevice(doc: IDeviceDB): DeviceResult {
    const cat = doc.categoryId as unknown as ICategoryDB | null;

    return {
        id: doc._id!.toString(),
        customerId: doc.customerId.toString(),
        category: cat && cat._id
            ? { id: cat._id.toString(), name: cat.name }
            : null,
        name: doc.name,
        manufacturer: doc.manufacturer,
        deviceModel: doc.deviceModel,
        platform: doc.platform,
        osVersion: doc.osVersion,
        createdAt: converToTimeZone(doc.createdAt),
    };
}

export function _formatDeviceProvider(doc: IDeviceDB): DeviceResult {
    return {
        name: doc.name,
        manufacturer: doc.manufacturer,
        deviceModel: doc.deviceModel,
        platform: doc.platform,
        osVersion: doc.osVersion,
    };
}
