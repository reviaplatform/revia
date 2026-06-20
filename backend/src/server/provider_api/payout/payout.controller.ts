import { unwrapResult } from '@server/utils/errors';
import { NextFunction, Response } from 'express';
import { HttpStatus } from '@/core/errors';
import { CustomProviderRequest } from '@server/middleware/isAuth';
import {
    createPayoutRequest,
    getProviderPayouts,
    getProviderWalletBalance,
    getProviderWalletTransactions,
} from '@/core/payout';

// ---------------------------------------------------------------------------
// 1. POST /api/v1/provider/payouts
//    Submit a payout request
// ---------------------------------------------------------------------------
export async function createPayout(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await createPayoutRequest(req.provider!, req.body);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Created, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 2. GET /api/v1/provider/payouts
//    List own brand's payout requests
// ---------------------------------------------------------------------------
export async function listPayouts(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await getProviderPayouts(req.provider!);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 3. GET /api/v1/provider/wallet/balance
//    Get current wallet balance
// ---------------------------------------------------------------------------
export async function getWalletBalance(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await getProviderWalletBalance(req.provider!);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}

// ---------------------------------------------------------------------------
// 4. GET /api/v1/provider/wallet/transactions
//    Paginated transaction history
// ---------------------------------------------------------------------------
export async function getWalletTransactions(req: CustomProviderRequest, res: Response, next: NextFunction) {
    try {
        const response = await getProviderWalletTransactions(req.provider!);
        const result = unwrapResult(response);
        res.JSON(HttpStatus.Ok, result);
    } catch (err) {
        next(err);
    }
}
