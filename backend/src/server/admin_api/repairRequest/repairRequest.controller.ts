import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { adminGetAllRepairRequests, adminGetRepairRequestById } from '@/core/repairRequest';
import { getInspectionByRequest } from '@/core/inspection';

// GET /api/v1/admin/repair-requests
export async function listAllRequests(_: CustomAdminRequest, res: Response, next: NextFunction) {
    try {
        const response = await adminGetAllRepairRequests();
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// GET /api/v1/admin/repair-requests/:requestId
export async function getRequest(req: CustomAdminRequest, res: Response, next: NextFunction) {
    try {
        const response = await adminGetRepairRequestById(req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// GET /api/v1/admin/repair-requests/:requestId/inspection
export async function getRequestInspection(req: CustomAdminRequest, res: Response, next: NextFunction) {
    try {
        const response = await getInspectionByRequest(req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}
