import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomCustomerRequest } from '@server/middleware/isAuth';
import {
    getCustomerDevices,
    getDevice,
    registerDevice,
    updateDevice,
} from '@/core/device';

/**
 * POST /api/v1/devices
 * Register a new device for the authenticated customer.
 */
export async function addDevice(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await registerDevice(req.user!, req.body);

        const result = unwrapResult(response);

        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/v1/devices
 * List all devices of the authenticated customer.
 */
export async function listMyDevices(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getCustomerDevices(req.user!);

        const result = unwrapResult(response);

        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/v1/devices/:id
 * Get a single device by ID (must belong to the authenticated customer).
 */
export async function getMyDevice(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await getDevice(req.user!, req.params.id as string);

        const result = unwrapResult(response);

        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/v1/devices/:id
 * Update an existing device of the authenticated customer.
 */
export async function editDevice(req: CustomCustomerRequest, res: Response, next: NextFunction) {
    try {
        const response = await updateDevice(req.user!, req.params.id as string, req.body);

        const result = unwrapResult(response);

        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}