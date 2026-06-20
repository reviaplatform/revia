import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { ApiError, HttpStatus } from '@/core/errors';
import { CustomAdminRequest } from '@server/middleware/isAuth';
import { validateId } from '@server/types/database';
import {
    adminGetAllPayouts,
    adminMarkPayoutSent,
    adminRejectPayout,
    adminGetAllWalletTransactions,
} from '@/core/payout';
import { PayoutStatus } from '@/database/models/brandPayout';

// ---------------------------------------------------------------------------
// 1. GET /api/v1/admin/payouts
//    List all payouts (optionally filter by status query param)
// ---------------------------------------------------------------------------
export async function getAllPayouts(req: CustomAdminRequest, res: Response, next: NextFunction) {
    try {
        const status = req.query.status as PayoutStatus | undefined;
        const response = await adminGetAllPayouts(status);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 2. PATCH /api/v1/admin/payouts/:id/send
//    Mark a payout as sent
// ---------------------------------------------------------------------------
export async function markPayoutSent(req: CustomAdminRequest, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        if (!validateId(id)) throw ApiError.notFoundPayout();

        const response = await adminMarkPayoutSent(req.admin!, id, req.body.adminNote);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 3. PATCH /api/v1/admin/payouts/:id/reject
//    Reject a payout
// ---------------------------------------------------------------------------
export async function rejectPayout(req: CustomAdminRequest, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        if (!validateId(id)) throw ApiError.notFoundPayout();

        const response = await adminRejectPayout(req.admin!, id, req.body.adminNote);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 4. GET /api/v1/admin/payouts/wallet/transactions
//    All wallet transactions (optionally filter by brandId query param)
// ---------------------------------------------------------------------------
export async function getAllWalletTransactions(req: CustomAdminRequest, res: Response, next: NextFunction) {
    try {
        const brandId = req.query.brandId as string | undefined;
        const response = await adminGetAllWalletTransactions(brandId);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}
