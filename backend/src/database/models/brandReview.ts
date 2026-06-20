import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBrandReviewDB extends Document {
    customerId: Types.ObjectId;
    brandId: Types.ObjectId;
    repairRequestId: Types.ObjectId;
    rating: number; // 1 to 5
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const brandReviewSchema = new Schema<IBrandReviewDB>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
            index: true,
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
            index: true,
        },
        repairRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'RepairRequest',
            required: true,
            unique: true, // One review per repair request
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

// Add index on brandId to efficiently get brand reviews
brandReviewSchema.index({ brandId: 1, createdAt: -1 });

const BrandReviewModel =
    mongoose.models.BrandReview ||
    mongoose.model<IBrandReviewDB>('BrandReview', brandReviewSchema);

export default BrandReviewModel;
