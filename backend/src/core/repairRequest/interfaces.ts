import { RepairRequestFlow, RepairRequestStatus } from '@/database/models/repairRequest';
import { DeviceResult } from '../device/interfaces';
import { BrandOfferResult } from '../brandOffer/interfaces';
import { PaymentMethod, PaymentStatus } from '@/database/models/payment';
import { InspectionResult } from '../inspection/interfaces';

export interface CreateRepairRequestData {
    deviceId: string;
    issueText: string;
    flow: RepairRequestFlow;
}

export interface StatusLogResult {
    status: RepairRequestStatus;
    timestamp: string;
}

export interface RepairRequestResult {
    id: string;
    customerId: string;
    deviceId: string;
    deviceName: string;
    issueText: string;
    flow: RepairRequestFlow;
    status: RepairRequestStatus;
    aiReport: string[];
    statusLogs: StatusLogResult[];
    selectedOfferId: string | null;
    createdAt: string;
    isReview?: boolean
    review?: {
        rating: number;
        comment: string;
        createdAt: string;
    }
}

export interface RepairRequestPrviderResult {
    id: string;
    device: DeviceResult;
    issueText: string;
    status: RepairRequestStatus;
    aiReport: string[];
    statusLogs: StatusLogResult[];
    selectedOfferId: string | null;
    createdAt: string;
    isSendOffer: boolean;
    offer: BrandOfferResult | null;
    inspectionPayment: {
        method: PaymentMethod;
        amount: number;
        commissionAmount: number;
        brandNet: number;
        status: PaymentStatus;
        paidAt: string | null;
    } | null;
    finalPayment: {
        method: PaymentMethod;
        amount: number;
        commissionAmount: number;
        brandNet: number;
        status: PaymentStatus;
        paidAt: string | null;
    } | null;
    inspection: InspectionResult | null;
}
