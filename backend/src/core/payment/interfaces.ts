import { PaymentMethod, PaymentStatus, PaymentType } from '@/database/models/payment';

export interface PaymentResult {
    id: string;
    repairRequestId: string;
    customerId: string;
    brandId: string;
    categoryId: string;
    type: PaymentType;
    method: PaymentMethod;
    amount: number;
    commissionAmount: number;
    brandNet: number;
    status: PaymentStatus;
    paidAt: string | null;
    createdAt: string;
}
