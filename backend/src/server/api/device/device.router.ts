import { Router } from 'express';
import * as deviceController from './device.controller';
import { isAuth } from '@server/middleware/isAuth';
import { userIsBanned } from '@server/middleware/isBanned';
import { validateBody } from '@server/middleware/validate';
import { registerDeviceSchema, updateDeviceSchema } from './device.valid';

const router = Router();

// GET /api/v1/devices 
router.get('/',
    isAuth,
    userIsBanned,
    deviceController.listMyDevices);

// GET /api/v1/devices/:id 
router.get('/:id',
    isAuth,
    userIsBanned,
    deviceController.getMyDevice);

// POST /api/v1/devices
router.post('/',
    isAuth,
    userIsBanned,
    validateBody(registerDeviceSchema),
    deviceController.addDevice);

// PATCH /api/v1/devices/:id 
router.patch('/:id',
    isAuth,
    userIsBanned,
    validateBody(updateDeviceSchema),
    deviceController.editDevice);

export default router;
