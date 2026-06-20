import { PayoutMethod, PayoutStatus } from '@/database/models/brandPayout';
import { WalletTransactionDirection, WalletTransactionType } from '@/database/models/brandWalletTransaction';

export interface InstapayDestinationInput {
    identifier: string;
    accountHolderName: string;
}

export interface BankDestinationInput {
    bankName: string;
    accountHolderName: string;
    iban: string;
    accountNumber?: string;
    swiftCode?: string;
}

export interface WalletDestinationInput {
    walletProvider: string;
    phoneNumber: string;
    accountHolderName: string;
}

export interface CreatePayoutData {
    amount: number;
    method: PayoutMethod;
    instapayDestination?: InstapayDestinationInput;
    bankDestination?: BankDestinationInput;
    walletDestination?: WalletDestinationInput;
}

export interface PayoutResult {
    id: string;
    brand: {
        id: string;
        name: { en: string; ar: string };
    } | null;
    requestedBy: {
        id: string;
        name: string;
    } | null;
    amount: number;
    method: PayoutMethod;
    status: PayoutStatus;
    instapayDestination: InstapayDestinationInput | null;
    bankDestination: BankDestinationInput | null;
    walletDestination: WalletDestinationInput | null;
    processedBy: {
        id: string;
        name: string;
    } | null;
    processedAt: string | null;
    adminNote: string | null;
    createdAt: string;
}

export interface WalletTransactionResult {
    id: string;
    brandId: string;
    type: WalletTransactionType;
    direction: WalletTransactionDirection;
    amount: number;
    balanceAfter: number;
    paymentId: string | null;
    payoutId: string | null;
    repairRequestId: string | null;
    note: string;
    createdAt: string;
}

export interface WalletBalanceResult {
    brandId: string;
    walletBalance: number;
    lockedBalance: number;
}
