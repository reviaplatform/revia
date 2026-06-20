import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Every event that changes a brand's walletBalance is recorded here.
 * This table is append-only — records must never be mutated.
 */

export enum WalletTransactionType {
    /**
     * Cash or POS booking completed.
     * Brand collected the full amount directly from the customer, so the
     * platform debits only its commission (`amount` = commissionAmount) from the wallet.
     */
    BOOKING_CASH_POS = 'booking_cash_pos',
    /**
     * Online booking completed (Visa / Wallet / BNPL / Bank-instalments).
     * Platform already holds the funds.
     * `amount` = brandNet = customer payment − platform commission.
     */
    BOOKING_ONLINE = 'booking_online',
    /**
     * Payout request approved and funds sent by admin.
     * Amount is negative (debit).
     */
    PAYOUT_SENT = 'payout_sent',
}

export enum WalletTransactionDirection {
    CREDIT = 'credit',
    DEBIT = 'debit',
}

export interface IBrandWalletTransactionDB extends Document {
    brandId: Types.ObjectId;
    type: WalletTransactionType;
    direction: WalletTransactionDirection;
    /** Absolute value (always positive). Positive = credit, context implies sign. */
    amount: number;
    /**
     * Running wallet balance AFTER this transaction is applied.
     * Stored for easy auditing / balance reconstruction.
     */
    balanceAfter: number;
    /** Payment that triggered this transaction (if applicable) */
    paymentId: Types.ObjectId | null;
    /** Payout request that triggered this transaction (if applicable) */
    payoutId: Types.ObjectId | null;
    /** Repair request reference (for display / filtering) */
    repairRequestId: Types.ObjectId | null;
    /** Human-readable note */
    note: string;
    createdAt: Date;
    updatedAt: Date;
}

const brandWalletTransactionSchema = new Schema<IBrandWalletTransactionDB>(
    {
        brandId: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(WalletTransactionType),
        },
        direction: {
            type: String,
            required: true,
            enum: Object.values(WalletTransactionDirection),
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        balanceAfter: {
            type: Number,
            required: true,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: 'Payment',
            default: null,
        },
        payoutId: {
            type: Schema.Types.ObjectId,
            ref: 'BrandPayout',
            default: null,
        },
        repairRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'RepairRequest',
            default: null,
        },
        note: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

brandWalletTransactionSchema.index({ brandId: 1, createdAt: -1 });
brandWalletTransactionSchema.index({ paymentId: 1 });
brandWalletTransactionSchema.index({ payoutId: 1 });
brandWalletTransactionSchema.index({ repairRequestId: 1 });
brandWalletTransactionSchema.index({ type: 1 });

const BrandWalletTransactionModel =
    mongoose.models.BrandWalletTransaction ||
    mongoose.model<IBrandWalletTransactionDB>(
        'BrandWalletTransaction',
        brandWalletTransactionSchema,
    );

export default BrandWalletTransactionModel;
