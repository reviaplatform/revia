import mongoose, { Document, Schema, Types } from 'mongoose';

/** One possible repair scenario within an offer */
export interface IOfferItem {
    expectedIssue: string;
    priceRange: {
        min: number;
        max: number;
    };
    expectedFinishDate: Date;
}

export enum BrandOfferStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

export interface IBrandOfferDB extends Document {
    repairRequestId: Types.ObjectId;
    brandId: Types.ObjectId;
    /** Index into brand.branches[] that will handle the repair */
    branchIndex: number;
    /** One or more repair scenario options presented by the brand */
    offerItems: IOfferItem[];
    /** Distance in km from the branch to the customer's location */
    distanceKm: number;
    /** Direct price charged for the physical inspection visit */
    inspectionPrice: number;
    status: BrandOfferStatus;
    createdAt: Date;
    updatedAt: Date;
}

const offerItemSchema = new Schema<IOfferItem>(
    {
        expectedIssue: {
            type: String,
            required: true,
            trim: true,
        },
        priceRange: {
            min: { type: Number, required: true, min: 0 },
            max: { type: Number, required: true, min: 0 },
        },
        expectedFinishDate: {
            type: Date,
            required: true,
        },
    },
    { _id: false, strict: true },
);

const brandOfferSchema = new Schema<IBrandOfferDB>(
    {
        repairRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'RepairRequest',
            required: true,
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
        },
        branchIndex: {
            type: Number,
            required: true,
            min: 0,
        },
        offerItems: {
            type: [offerItemSchema],
            required: true,
            validate: {
                validator: (arr: IOfferItem[]) => arr.length > 0,
                message: 'An offer must contain at least one offer item.',
            },
        },
        distanceKm: {
            type: Number,
            required: true,
            min: 0,
        },
        inspectionPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            required: true,
            default: BrandOfferStatus.PENDING,
            enum: Object.values(BrandOfferStatus),
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

brandOfferSchema.index({ repairRequestId: 1 });
brandOfferSchema.index({ brandId: 1 });
brandOfferSchema.index({ status: 1 });

const BrandOfferModel =
    mongoose.models.BrandOffer ||
    mongoose.model<IBrandOfferDB>('BrandOffer', brandOfferSchema);

export default BrandOfferModel;
