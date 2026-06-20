export type RepairStatus =
    | 'ai_assessing'
    | 'pending_brand_selection'
    | 'pending_offers'
    | 'offer_selected'
    | 'inspection_pending'
    | 'inspection_done'
    | 'payment_pending'
    | 'payment_done'
    | 'pending_provider_repair'
    | 'pending_user_device_pickup'
    | 'completed'
    | 'cancelled';

export type PayMethod = 'cash' | 'pos';

export interface PriceRange {
    min: number;
    max: number;
}

export interface OfferItem {
    expectedIssue: string;
    priceRange: PriceRange;
    expectedFinishDate: string;
}

export interface SendOfferRequest {
    branchIndex: number;
    offerItems: OfferItem[];
    distanceKm: number;
    inspectionPrice: number;
}

export interface InspectionResultRequest {
    resultNotes: string;
    finalPrice: number;
    images: string[];
}

export interface RepairDevice {
    name?: string;
    manufacturer?: string;
    deviceModel?: string;
    platform?: string;
    osVersion?: string;
}

export interface PaymentDetails {
    method: string;
    amount: number;
    commissionAmount: number;
    brandNet: number;
    status: string;
    paidAt: string | null;
}

export interface OfferDetails {
    id: string;
    repairRequestId: string;
    brandId: string;
    branchIndex: number;
    offerItems: OfferItem[];
    distanceKm: number;
    inspectionPrice: number;
    status: string;
    createdAt: string;
}

export interface InspectionDetails {
    id: string;
    repairRequestId: string;
    brandOfferId: string;
    brandId: string;
    customerId: string;
    resultNotes: string;
    finalPrice: number;
    images: string[];
    createdAt: string;
}

export interface StatusLog {
    status: RepairStatus;
    timestamp: string;
}

export interface RepairRequest {
    id: string;
    status: RepairStatus;
    device?: RepairDevice;
    issueText?: string;
    createdAt: string;
    isSendOffer?: boolean;
    offer?: OfferDetails | null;
    inspectionPayment?: PaymentDetails | null;
    finalPayment?: PaymentDetails | null;
    selectedOfferId?: string | null;
    statusLogs?: StatusLog[];
    aiReport?: string[];
    inspection?: InspectionDetails | null;
}
