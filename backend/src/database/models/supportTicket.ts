import mongoose, { Document, Schema, Types } from 'mongoose';

export enum SupportTicketSenderType {
    CUSTOMER = 'Customer',
    BRAND = 'Brand',
}

export enum SupportTicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export interface ISupportTicketDB extends Document {
    senderType: SupportTicketSenderType;
    customerId?: Types.ObjectId;
    brandId?: Types.ObjectId;
    subject: string;
    message: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicketDB>(
    {
        senderType: {
            type: String,
            required: true,
            enum: Object.values(SupportTicketSenderType),
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            index: true,
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            index: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(SupportTicketStatus),
            default: SupportTicketStatus.OPEN,
        },
        priority: {
            type: String,
            required: true,
            enum: Object.values(SupportTicketPriority),
            default: SupportTicketPriority.MEDIUM,
        },
        adminNote: {
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

// Indexes for common queries
supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ senderType: 1, status: 1 });

const SupportTicketModel =
    mongoose.models.SupportTicket ||
    mongoose.model<ISupportTicketDB>('SupportTicket', supportTicketSchema);

export default SupportTicketModel;
