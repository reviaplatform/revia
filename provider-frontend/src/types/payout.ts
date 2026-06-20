export type PayoutMethod = 'instapay' | 'bank' | 'wallet';
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'sent';

export interface InstapayDestination {
    identifier: string;
    accountHolderName: string;
}

export interface BankDestination {
    bankName: string;
    accountHolderName: string;
    iban: string;
    accountNumber: string;
    swiftCode: null;
}

export interface WalletDestination {
    walletProvider: string;
    phoneNumber: string;
    accountHolderName: string;
}

export interface PayoutRequest {
    amount: number;
    method: PayoutMethod;
    instapayDestination?: InstapayDestination;
    bankDestination?: BankDestination;
    walletDestination?: WalletDestination;
}

export interface Payout {
    id: string;
    amount: number;
    method: PayoutMethod;
    status: PayoutStatus;
    createdAt: string;
    instapayDestination?: InstapayDestination;
    bankDestination?: BankDestination;
    walletDestination?: WalletDestination;
}

export interface WalletBalance {
    balance: number;
    currency?: string;
}

export interface WalletTransaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description?: string;
    createdAt: string;
}
