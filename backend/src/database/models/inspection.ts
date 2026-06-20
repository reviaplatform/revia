import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInspectionDB extends Document {
    repairRequestId: Types.ObjectId;
    brandOfferId: Types.ObjectId;
    brandId: Types.ObjectId;
    customerId: Types.ObjectId;
    /** Brand's notes describing the actual issue found during inspection */
    resultNotes: string;
    /** Final repair price determined after physical inspection */
    finalPrice: number;
    /** Optional photo evidence URLs uploaded by the brand */
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

const inspectionSchema = new Schema<IInspectionDB>(
    {
        repairRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'RepairRequest',
            required: true,
        },
        brandOfferId: {
            type: Schema.Types.ObjectId,
            ref: 'BrandOffer',
            required: true,
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        resultNotes: {
            type: String,
            required: true,
            trim: true,
        },
        finalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        images: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

inspectionSchema.index({ repairRequestId: 1 });
inspectionSchema.index({ brandId: 1 });
inspectionSchema.index({ customerId: 1 });


const InspectionModel =
    mongoose.models.Inspection ||
    mongoose.model<IInspectionDB>('Inspection', inspectionSchema);

export default InspectionModel;
