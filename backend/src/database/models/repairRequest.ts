import mongoose, { Document, Schema, Types } from 'mongoose';
import { log } from '@/log';
import EmailServices from '@/core/utils/email';
import CustomerModel from './customer';
import DeviceModel from './device';

/** The two customer-facing flows for submitting a repair request */
export enum RepairRequestFlow {
    DIRECT = 'direct',     // customer sends request directly to nearest brand
    AI_CHAT = 'ai_chat',   // customer chats with AI first, then request is forwarded
}

/** Full lifecycle status of a repair request */
export enum RepairRequestStatus {
    /** Customer is chatting with the AI model (Flow 2 only) */
    AI_ASSESSING = 'ai_assessing',
    /** Platform is assigning brand(s) to the request */
    PENDING_BRAND_SELECTION = 'pending_brand_selection',
    /** Request sent to brand(s); waiting for offer(s) */
    PENDING_OFFERS = 'pending_offers',
    /** Customer accepted an offer; inspection fee payment pending */
    OFFER_SELECTED = 'offer_selected',
    /** Inspection fee paid; waiting for brand to submit inspection result */
    INSPECTION_PENDING = 'inspection_pending',
    INSPECTION_DONE = 'inspection_done',
    /** Customer must pay the final repair price */
    PAYMENT_PENDING = 'payment_pending',
    PAYMENT_DONE = 'payment_done',
    PENDING_PROVIDER_REPAIR = 'pending_provider_repair',
    /** Final payment made; repair done — waiting for customer to collect device */
    PENDING_USER_DEVICE_PICKUP = 'pending_user_device_pickup',
    /** Customer collected device — repair fully completed */
    COMPLETED = 'completed',
    /** Customer cancelled the request */
    CANCELLED = 'cancelled',
}

export interface IStatusLog {
    status: RepairRequestStatus;
    timestamp: Date;
}

export interface IRepairRequestDB extends Document {
    customerId: Types.ObjectId;
    deviceId: Types.ObjectId;
    issueText: string;
    flow: RepairRequestFlow;
    status: RepairRequestStatus;
    /** AI-generated bullet-point report; populated after AI chat finishes (Flow 2) */
    aiReport: string[];
    /** Brand IDs that the platform has assigned to handle this request */
    assignedBrandIds: Types.ObjectId[];
    /** The offer the customer selected */
    selectedOfferId: Types.ObjectId | null;
    statusLogs: IStatusLog[];
    /** Timestamp of the last "device ready for pickup" email/reminder sent to the customer */
    pickupReminderSentAt: Date | null;
    /** Timestamp of the last "care" check-in email sent for a completed repair */
    careEmailSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const repairRequestSchema = new Schema<IRepairRequestDB>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        deviceId: {
            type: Schema.Types.ObjectId,
            ref: 'Device',
            required: true,
        },
        issueText: {
            type: String,
            required: true,
            trim: true,
        },
        flow: {
            type: String,
            required: true,
            enum: Object.values(RepairRequestFlow),
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(RepairRequestStatus),
        },
        aiReport: {
            type: [String],
            default: [],
        },
        assignedBrandIds: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Brand',
            },
        ],
        selectedOfferId: {
            type: Schema.Types.ObjectId,
            ref: 'BrandOffer',
            default: null,
        },
        statusLogs: {
            type: [
                {
                    status: {
                        type: String,
                        enum: Object.values(RepairRequestStatus),
                        required: true,
                    },
                    timestamp: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            default: [],
        },
        pickupReminderSentAt: {
            type: Date,
            default: null,
        },
        careEmailSentAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

function formatStatusLabel(status: RepairRequestStatus): string {
    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Best-effort: email the customer whenever an existing request's status changes.
// Never throws — a notification failure must not affect the save() caller.
async function notifyStatusChange(doc: IRepairRequestDB): Promise<void> {
    try {
        const customer = await CustomerModel.findById(doc.customerId);
        if (!customer?.email) return;

        const device = await DeviceModel.findById(doc.deviceId);
        const deviceName = device?.name ?? 'device';

        if (doc.status === RepairRequestStatus.PENDING_USER_DEVICE_PICKUP) {
            await EmailServices.sendDeviceReadyForPickup(customer.email, deviceName);
            doc.pickupReminderSentAt = new Date();
            await doc.save();
        } else if (doc.status === RepairRequestStatus.COMPLETED) {
            await EmailServices.sendCareCheckIn(customer.email, deviceName);
            doc.careEmailSentAt = new Date();
            await doc.save();
        } else {
            await EmailServices.sendStatusUpdate(customer.email, deviceName, formatStatusLabel(doc.status));
        }
    } catch (err) {
        log.error('[repairRequest] failed to send status-change notification:', err);
    }
}

repairRequestSchema.pre('save', function (next) {
    this.$locals.statusChanged = this.isModified('status') && !this.isNew;

    if (this.isModified('status') || this.isNew) {
        this.statusLogs.push({
            status: this.status,
            timestamp: new Date(),
        });
    }
    next();
});

repairRequestSchema.post('save', function (doc) {
    if (doc.$locals.statusChanged) {
        void notifyStatusChange(doc);
    }
});

repairRequestSchema.index({ customerId: 1 });
repairRequestSchema.index({ status: 1 });
repairRequestSchema.index({ assignedBrandIds: 1 });
repairRequestSchema.index({ selectedOfferId: 1 });

const RepairRequestModel =
    mongoose.models.RepairRequest ||
    mongoose.model<IRepairRequestDB>('RepairRequest', repairRequestSchema);

export default RepairRequestModel;
