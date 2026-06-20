import mongoose, { Document, Schema, Types } from 'mongoose';

export enum PaymentType {
    /** Fee paid by the customer to allow the brand to perform the inspection */
    INSPECTION = 'inspection',
    /** Final repair price paid by the customer after inspection */
    FINAL = 'final',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

export enum PaymentMethod {
    CASH = 'cash',
    POS = 'pos',
    ONLINE = 'online',
}

/** Methods considered "online" — platform commission is deducted before crediting brand wallet */
export const ONLINE_PAYMENT_METHODS = new Set<PaymentMethod>([
    PaymentMethod.ONLINE,
]);

/** Returns true when the payment was collected online (platform-side) */
export const isOnlinePaymentMethod = (method: PaymentMethod): boolean =>
    ONLINE_PAYMENT_METHODS.has(method);

export interface IPaymentDB extends Document {
    repairRequestId: Types.ObjectId;
    customerId: Types.ObjectId;
    brandId: Types.ObjectId;
    /** Category of the device at the time of payment (for commission lookup) */
    categoryId: Types.ObjectId;
    type: PaymentType;
    method: PaymentMethod;
    /** Total amount collected from the customer */
    amount: number;
    /**
     * Platform commission for this payment.
     * Calculated from Category.commissionPerRequest at payment time.
     */
    commissionAmount: number;
    /**
     * Net amount earned by the brand after commission (amount - commissionAmount),
     * for reporting purposes. The actual wallet movement differs by channel:
     * online payments credit this amount to the wallet (platform held the funds),
     * cash/POS payments only debit commissionAmount (brand already holds the rest in cash).
     */
    brandNet: number;
    status: PaymentStatus;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDB>(
    {
        repairRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'RepairRequest',
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(PaymentType),
        },
        method: {
            type: String,
            required: true,
            enum: Object.values(PaymentMethod),
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        commissionAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        brandNet: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        status: {
            type: String,
            required: true,
            default: PaymentStatus.PENDING,
            enum: Object.values(PaymentStatus),
        },
        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

paymentSchema.index({ repairRequestId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ brandId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ method: 1 });

const PaymentModel =
    mongoose.models.Payment ||
    mongoose.model<IPaymentDB>('Payment', paymentSchema);

export default PaymentModel;
