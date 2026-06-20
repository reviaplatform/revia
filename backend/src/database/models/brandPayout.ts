import mongoose, { Document, Schema, Types } from 'mongoose';

export enum PayoutMethod {
    /** InstaPay transfer (Egyptian instant-payment network) */
    INSTAPAY = 'instapay',
    /** Direct bank transfer */
    BANK = 'bank',
    /** Mobile wallet (Vodafone Cash, Orange Money, Etisalat Cash, etc.) */
    WALLET = 'wallet',
}

export enum PayoutStatus {
    /** Brand submitted the request; awaiting admin review */
    PENDING = 'pending',
    /** Admin has transferred the funds */
    SENT = 'sent',
    /** Admin rejected the payout request */
    REJECTED = 'rejected',
}

/**
 * Payout destination for InstaPay.
 * The brand provides either a phone number or an IPA (InstaPay Address).
 */
export interface IInstapayDestination {
    /** Either a mobile number or an IPA (e.g. "brand@instapay") */
    identifier: string;
    accountHolderName: string;
}

/**
 * Payout destination for bank-transfer.
 */
export interface IBankDestination {
    bankName: string;
    accountHolderName: string;
    /** Egyptian IBAN (27 chars) */
    iban: string;
    /** Optionally provided alongside IBAN for human reference */
    accountNumber: string | null;
    swiftCode: string | null;
}

/**
 * Payout destination for a mobile wallet.
 */
export interface IWalletDestination {
    /** "vodafone_cash" | "orange_money" | "etisalat_cash" | "we_pay" | "fawry" etc. */
    walletProvider: string;
    phoneNumber: string;
    accountHolderName: string;
}

export interface IBrandPayoutDB extends Document {
    brandId: Types.ObjectId;
    /** Provider (brand owner) who created the request */
    requestedBy: Types.ObjectId;
    /** Amount the brand wants to withdraw */
    amount: number;
    method: PayoutMethod;
    status: PayoutStatus;

    // Exactly one of the three destination objects is populated based on `method`
    instapayDestination: IInstapayDestination | null;
    bankDestination: IBankDestination | null;
    walletDestination: IWalletDestination | null;

    /** Admin who processed (sent/rejected) this payout */
    processedBy: Types.ObjectId | null;
    /** Timestamp when admin marked the payout as sent/rejected */
    processedAt: Date | null;
    /** Free-text note from admin (e.g. rejection reason, transfer reference) */
    adminNote: string | null;

    createdAt: Date;
    updatedAt: Date;
}

const instapayDestinationSchema = new Schema<IInstapayDestination>(
    {
        identifier: { type: String, required: true, trim: true },
        accountHolderName: { type: String, required: true, trim: true },
    },
    { _id: false, strict: true },
);

const bankDestinationSchema = new Schema<IBankDestination>(
    {
        bankName: { type: String, required: true, trim: true },
        accountHolderName: { type: String, required: true, trim: true },
        iban: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            validate: {
                validator: (v: string) => /^EG\d{25}$/.test(v),
                message: 'IBAN must be a valid Egyptian IBAN (EG + 25 digits)',
            },
        },
        accountNumber: { type: String, default: null, trim: true },
        swiftCode: { type: String, default: null, trim: true, uppercase: true },
    },
    { _id: false, strict: true },
);

const walletDestinationSchema = new Schema<IWalletDestination>(
    {
        walletProvider: { type: String, required: true, trim: true, lowercase: true },
        phoneNumber: { type: String, required: true, trim: true },
        accountHolderName: { type: String, required: true, trim: true },
    },
    { _id: false, strict: true },
);

// ---------------------------------------------------------------------------
// Main schema
// ---------------------------------------------------------------------------

const brandPayoutSchema = new Schema<IBrandPayoutDB>(
    {
        brandId: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
            index: true,
        },
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        method: {
            type: String,
            required: true,
            enum: Object.values(PayoutMethod),
        },
        status: {
            type: String,
            required: true,
            default: PayoutStatus.PENDING,
            enum: Object.values(PayoutStatus),
        },

        instapayDestination: {
            type: instapayDestinationSchema,
            default: null,
        },
        bankDestination: {
            type: bankDestinationSchema,
            default: null,
        },
        walletDestination: {
            type: walletDestinationSchema,
            default: null,
        },

        processedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },
        processedAt: {
            type: Date,
            default: null,
        },
        adminNote: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

// Ensure the correct destination sub-doc is present for the chosen method
brandPayoutSchema.pre('validate', function (next) {
    const doc = this as IBrandPayoutDB;
    const method = doc.method;

    if (method === PayoutMethod.INSTAPAY && !doc.instapayDestination) {
        return next(new Error('instapayDestination is required when method is instapay'));
    }
    if (method === PayoutMethod.BANK && !doc.bankDestination) {
        return next(new Error('bankDestination is required when method is bank'));
    }
    if (method === PayoutMethod.WALLET && !doc.walletDestination) {
        return next(new Error('walletDestination is required when method is wallet'));
    }

    next();
});

brandPayoutSchema.index({ brandId: 1, status: 1 });
brandPayoutSchema.index({ status: 1, createdAt: -1 });
brandPayoutSchema.index({ processedBy: 1 });

const BrandPayoutModel =
    mongoose.models.BrandPayout ||
    mongoose.model<IBrandPayoutDB>('BrandPayout', brandPayoutSchema);

export default BrandPayoutModel;
