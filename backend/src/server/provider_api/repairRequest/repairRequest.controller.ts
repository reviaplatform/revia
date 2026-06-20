import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import {
    providerGetPendingOfferRequests,
    providerGetActiveRequests,
    providerFinishRepair,
    providerGiveDeviceToUser,
    providerGetRepairRequestById,
} from '@/core/repairRequest';
import { createBrandOffer } from '@/core/brandOffer';
import { createInspection } from '@/core/inspection';
import { payFinalPrice, payInspectionFee } from '@/core/payment';

// ---------------------------------------------------------------------------
// 1. GET /api/v1/provider/repair-requests/active
//    Assigned requests that are past the offer stage (in progress)
// ---------------------------------------------------------------------------
export async function listActiveRequests(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await providerGetActiveRequests(req.provider!);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 2. GET /api/v1/provider/repair-requests/pending-offers
//    Assigned requests still waiting for this brand to send an offer
// ---------------------------------------------------------------------------
export async function listPendingOfferRequests(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await providerGetPendingOfferRequests(req.provider!);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 3. GET /api/v1/provider/repair-requests/:requestId
//    Get single repair request
// ---------------------------------------------------------------------------
export async function getSingleRequest(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await providerGetRepairRequestById(req.provider!, req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 4. POST /api/v1/provider/repair-requests/:requestId/offer
//    Send an offer for a repair request
// ---------------------------------------------------------------------------
export async function sendOffer(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await createBrandOffer(req.provider!, {
            repairRequestId: req.params.requestId as string,
            ...req.body,
        });
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 4. POST /api/v1/provider/repair-requests/:requestId/inspection
//    Submit inspection result (after customer pays inspection fee)
// ---------------------------------------------------------------------------
export async function sendInspection(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await createInspection(req.provider!, req.params.requestId as string, req.body);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 5. POST /api/v1/provider/repair-requests/:requestId/finish
//    Mark repair as done → status becomes pending_user_device_pickup
// ---------------------------------------------------------------------------
export async function finishRepair(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await providerFinishRepair(req.provider!, req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

export async function giveDeviceToUser(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await providerGiveDeviceToUser(req.provider!, req.params.requestId as string);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

export async function payInspection(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const paymentMethod = req.body.paymentMethod;

        const response = await payInspectionFee(
            null,
            req.params.requestId as string,
            paymentMethod,
        );
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

export async function payFinal(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const paymentMethod = req.body.paymentMethod;

        const response = await payFinalPrice(
            null,
            req.params.requestId as string,
            paymentMethod
        );
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}