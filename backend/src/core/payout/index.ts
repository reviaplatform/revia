import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { IProviderDB } from '@/database/models/provider';
import { IAdminDB } from '@/database/models/admin';
import BrandModel from '@/database/models/brand';
import BrandPayoutModel, { IBrandPayoutDB, PayoutStatus } from '@/database/models/brandPayout';
import BrandWalletTransactionModel, {
    IBrandWalletTransactionDB,
    WalletTransactionDirection,
    WalletTransactionType,
} from '@/database/models/brandWalletTransaction';
import {
    CreatePayoutData,
    PayoutResult,
    WalletBalanceResult,
    WalletTransactionResult,
} from './interfaces';

const MIN_PAYOUT_AMOUNT = 50; // Minimum payout 50 EGP

// ---------------------------------------------------------------------------
// Provider: Create a payout request
// ---------------------------------------------------------------------------
export async function createPayoutRequest(
    provider: IProviderDB,
    data: CreatePayoutData,
): AsyncSafeResult<PayoutResult> {
    try {
        const brand = await BrandModel.findById(provider.brandId);
        if (!brand) throw ApiError.notFoundBrand();

        if (data.amount < MIN_PAYOUT_AMOUNT) throw ApiError.payoutAmountTooLow();
        if (brand.walletBalance < data.amount) throw ApiError.insufficientWalletBalance();

        const payout = await BrandPayoutModel.create({
            brandId: provider.brandId,
            requestedBy: provider._id,
            amount: data.amount,
            method: data.method,
            instapayDestination: data.instapayDestination ?? null,
            bankDestination: data.bankDestination ?? null,
            walletDestination: data.walletDestination ?? null,
        });

        // Debit brand wallet
        brand.walletBalance -= payout.amount;
        brand.lockedBalance += payout.amount;
        await brand.save();

        const populatedPayout = await BrandPayoutModel.findById(payout._id)
            .populate('brandId')
            .populate('requestedBy')
            .populate('processedBy');

        return { result: _formatPayout(populatedPayout!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Provider: Get own brand's payout requests
// ---------------------------------------------------------------------------
export async function getProviderPayouts(
    provider: IProviderDB,
): AsyncSafeResult<PayoutResult[]> {
    try {
        const payouts = await BrandPayoutModel.find({ brandId: provider.brandId })
            .populate('brandId')
            .populate('requestedBy')
            .populate('processedBy')
            .sort('-createdAt');
        return { result: payouts.map(_formatPayout), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Provider: Get wallet balance
// ---------------------------------------------------------------------------
export async function getProviderWalletBalance(
    provider: IProviderDB,
): AsyncSafeResult<WalletBalanceResult> {
    try {
        const brand = await BrandModel.findById(provider.brandId);
        if (!brand) throw ApiError.notFoundBrand();

        return {
            result: {
                brandId: brand._id!.toString(),
                walletBalance: brand.walletBalance,
                lockedBalance: brand.lockedBalance,
            },
            error: null,
        };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Provider: Get wallet transactions
// ---------------------------------------------------------------------------
export async function getProviderWalletTransactions(
    provider: IProviderDB,
): AsyncSafeResult<WalletTransactionResult[]> {
    try {
        const txns = await BrandWalletTransactionModel.find({ brandId: provider.brandId })
            .sort('-createdAt');
        return { result: txns.map(_formatWalletTransaction), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: Get all payout requests (optionally filter by status)
// ---------------------------------------------------------------------------
export async function adminGetAllPayouts(
    status?: PayoutStatus,
): AsyncSafeResult<PayoutResult[]> {
    try {
        const filter: Record<string, unknown> = {};
        if (status) filter.status = status;

        const payouts = await BrandPayoutModel.find(filter)
            .populate('brandId')
            .populate('requestedBy')
            .populate('processedBy')
            .sort('-createdAt');
        return { result: payouts.map(_formatPayout), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: Mark payout as sent
// ---------------------------------------------------------------------------
export async function adminMarkPayoutSent(
    admin: IAdminDB,
    payoutId: string,
    adminNote?: string,
): AsyncSafeResult<PayoutResult> {
    try {
        const payout = await BrandPayoutModel.findById(payoutId);
        if (!payout) throw ApiError.notFoundPayout();
        if (payout.status !== PayoutStatus.PENDING) throw ApiError.payoutAlreadyProcessed();

        // Re-check balance to prevent race conditions
        const brand = await BrandModel.findById(payout.brandId);
        if (!brand) throw ApiError.notFoundBrand();
        if (brand.walletBalance < payout.amount) throw ApiError.insufficientWalletBalance();

        // Mark payout as sent
        payout.status = PayoutStatus.SENT;
        payout.processedBy = admin._id as any;
        payout.processedAt = new Date();
        payout.adminNote = adminNote ?? null;
        await payout.save();

        // Debit brand wallet
        brand.lockedBalance -= payout.amount;
        await brand.save();

        // Create audit transaction
        await BrandWalletTransactionModel.create({
            brandId: payout.brandId,
            type: WalletTransactionType.PAYOUT_SENT,
            direction: WalletTransactionDirection.DEBIT,
            amount: payout.amount,
            balanceAfter: brand.walletBalance,
            payoutId: payout._id,
            note: `Payout via ${payout.method}${adminNote ? ` — ${adminNote}` : ''}`,
        });

        const populatedPayout = await BrandPayoutModel.findById(payout._id)
            .populate('brandId')
            .populate('requestedBy')
            .populate('processedBy');

        return { result: _formatPayout(populatedPayout!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: Reject payout
// ---------------------------------------------------------------------------
export async function adminRejectPayout(
    admin: IAdminDB,
    payoutId: string,
    adminNote?: string,
): AsyncSafeResult<PayoutResult> {
    try {
        const payout = await BrandPayoutModel.findById(payoutId);
        if (!payout) throw ApiError.notFoundPayout();
        if (payout.status !== PayoutStatus.PENDING) throw ApiError.payoutAlreadyProcessed();

        payout.status = PayoutStatus.REJECTED;
        payout.processedBy = admin._id as any;
        payout.processedAt = new Date();
        payout.adminNote = adminNote ?? null;
        await payout.save();

        const populatedPayout = await BrandPayoutModel.findById(payout._id)
            .populate('brandId')
            .populate('requestedBy')
            .populate('processedBy');

        return { result: _formatPayout(populatedPayout!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: Get all wallet transactions (optionally filter by brandId)
// ---------------------------------------------------------------------------
export async function adminGetAllWalletTransactions(
    brandId?: string,
): AsyncSafeResult<WalletTransactionResult[]> {
    try {
        const filter: Record<string, unknown> = {};
        if (brandId) filter.brandId = brandId;

        const txns = await BrandWalletTransactionModel.find(filter).sort('-createdAt');
        return { result: txns.map(_formatWalletTransaction), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

function _formatPayout(doc: IBrandPayoutDB): PayoutResult {
    const brand = doc.brandId as any;
    const requestedBy = doc.requestedBy as any;
    const processedBy = doc.processedBy as any;

    return {
        id: doc._id!.toString(),
        brand: brand && brand.name ? {
            id: brand._id.toString(),
            name: typeof brand.name === 'object' ? brand.name : { en: brand.name, ar: brand.name }
        } : null,
        requestedBy: requestedBy && requestedBy.name ? {
            id: requestedBy._id.toString(),
            name: requestedBy.name
        } : null,
        amount: doc.amount,
        method: doc.method,
        status: doc.status,
        instapayDestination: doc.instapayDestination ?? null,
        bankDestination: doc.bankDestination
            ? {
                bankName: doc.bankDestination.bankName,
                accountHolderName: doc.bankDestination.accountHolderName,
                iban: doc.bankDestination.iban,
                accountNumber: doc.bankDestination.accountNumber ?? undefined,
                swiftCode: doc.bankDestination.swiftCode ?? undefined,
            }
            : null,
        walletDestination: doc.walletDestination ?? null,
        processedBy: processedBy && processedBy.name ? {
            id: processedBy._id.toString(),
            name: processedBy.name
        } : null,
        processedAt: doc.processedAt ? converToTimeZone(doc.processedAt) : null,
        adminNote: doc.adminNote ?? null,
        createdAt: converToTimeZone(doc.createdAt),
    };
}

function _formatWalletTransaction(doc: IBrandWalletTransactionDB): WalletTransactionResult {
    return {
        id: doc._id!.toString(),
        brandId: doc.brandId.toString(),
        type: doc.type,
        direction: doc.direction,
        amount: doc.amount,
        balanceAfter: doc.balanceAfter,
        paymentId: doc.paymentId?.toString() ?? null,
        payoutId: doc.payoutId?.toString() ?? null,
        repairRequestId: doc.repairRequestId?.toString() ?? null,
        note: doc.note,
        createdAt: converToTimeZone(doc.createdAt),
    };
}
