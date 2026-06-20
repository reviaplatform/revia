"use client"

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Wallet,
    AltArrowUp as PayoutIcon,
    AltArrowDown as DepositIcon,
    AddCircle,
    CheckCircle,
    Help as PendingIcon,
    CloseCircle,
    Smartphone,
    InfoCircle,
    History,
    BillList,
    CardTransfer,
    TransferHorizontal,
    Globus,
    User
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Portal } from '@/components/ui/Portal';
import { useTranslations, useLocale, useFormatter } from 'next-intl';

interface WalletBalance {
    walletBalance: number;
    lockedBalance: number;
}

interface Transaction {
    id: string;
    type: string;
    direction: 'credit' | 'debit';
    amount: number;
    balanceAfter: number;
    note: string;
    createdAt: string;
}

interface PayoutRequest {
    id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'processed' | 'sent';
    method: 'instapay' | 'bank' | 'wallet';
    createdAt: string;
}

export default function PayoutsPage() {
    const t = useTranslations('Payouts');
    const locale = useLocale();
    const format = useFormatter();
    const [balance, setBalance] = useState<WalletBalance>({ walletBalance: 0, lockedBalance: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Request Payout Modal
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [payoutForm, setPayoutForm] = useState({
        amount: 0,
        method: 'instapay' as 'instapay' | 'bank' | 'wallet',
        instapayDestination: { identifier: '', accountHolderName: '' },
        bankDestination: { bankName: '', accountHolderName: '', iban: '', accountNumber: '', swiftCode: null },
        walletDestination: { walletProvider: '', phoneNumber: '', accountHolderName: '' }
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [balRes, transRes, payRes] = await Promise.all([
                apiClient.get('/payouts/wallet/balance'),
                apiClient.get('/payouts/wallet/transactions'),
                apiClient.get('/payouts')
            ]);
            setBalance(balRes.data.data);
            setTransactions(transRes.data.data || []);
            setPayouts(payRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch payout data', error);
            toast.error(t('syncError'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmitPayout = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Amount Validation (Min 50 EGP)
        if (payoutForm.amount < 50) {
            return toast.error(t('modal.minAmountError'));
        }
        if (payoutForm.amount > balance.walletBalance) {
            return toast.error(t('modal.insufficientBalance'));
        }

        // 2. Method Specific Validation
        try {
            if (payoutForm.method === 'instapay') {
                const { identifier, accountHolderName } = payoutForm.instapayDestination;
                if (identifier.trim().length < 3 || identifier.length > 100) throw new Error(t('modal.instapay.error'));
                if (accountHolderName.trim().length < 2 || accountHolderName.length > 100) throw new Error(t('modal.holderNameError'));
            }

            if (payoutForm.method === 'bank') {
                const { bankName, accountHolderName, iban, accountNumber, swiftCode } = payoutForm.bankDestination;
                if (bankName.trim().length < 2 || bankName.length > 100) throw new Error(t('modal.bank.bankNameError'));
                if (accountHolderName.trim().length < 2 || accountHolderName.length > 100) throw new Error(t('modal.holderNameError'));
                if (!/^EG\d{25}$/.test(iban.toUpperCase())) throw new Error(t('modal.bank.ibanError'));
                if (accountNumber && accountNumber.length > 30) throw new Error(t('modal.bank.accountNumberError'));
            }

            if (payoutForm.method === 'wallet') {
                const { walletProvider, phoneNumber, accountHolderName } = payoutForm.walletDestination;
                if (!walletProvider) throw new Error(t('modal.wallet.providerError'));
                if (phoneNumber.length !== 11) throw new Error(t('modal.wallet.phoneError'));
                if (accountHolderName.trim().length < 2 || accountHolderName.length > 100) throw new Error(t('modal.holderNameError'));
            }
        } catch (error: any) {
            return toast.error(error.message);
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                amount: payoutForm.amount,
                method: payoutForm.method
            };

            if (payoutForm.method === 'instapay') payload.instapayDestination = payoutForm.instapayDestination;
            if (payoutForm.method === 'bank') payload.bankDestination = payoutForm.bankDestination;
            if (payoutForm.method === 'wallet') payload.walletDestination = payoutForm.walletDestination;

            await apiClient.post('/payouts', payload);
            toast.success(t('modal.success'));
            setShowRequestModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('modal.fail'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return format.number(value, { style: 'currency', currency: 'EGP' });
    };

    return (
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-wf-border">
                <div className="space-y-2 text-start">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
                            <Wallet className="size-6" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
                            {t('title')}
                        </h1>
                    </div>
                    <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
                        {t('subtitle')}
                    </p>
                </div>
                <Button 
                    onClick={() => setShowRequestModal(true)} 
                    disabled={balance.walletBalance <= 0}
                    className="h-14 rounded-wf px-10 font-black bg-primary hover:bg-primary/90 text-white shadow-none border-b-4 border-primary/20 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-30 disabled:grayscale"
                >
                    <PayoutIcon className={cn("size-5", locale === 'ar' ? "ml-3" : "mr-3")} />
                    {t('requestPayout')}
                </Button>
            </div>

            {/* Balance Overview - Heroic Offset */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                {isLoading ? (
                    <Card className="lg:col-span-8 p-16 border-none bg-white rounded-wf flex flex-col justify-between space-y-16">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-6" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-baseline gap-6">
                                <Skeleton className="h-24 w-64" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <div className="pt-12 border-t border-wf-border flex gap-10">
                            <Skeleton className="h-10 w-40 rounded-wf" />
                            <Skeleton className="h-10 w-40 rounded-wf" />
                        </div>
                    </Card>
                ) : (
                    <Card className="lg:col-span-8 relative overflow-hidden p-8 md:p-16 border-none bg-white rounded-wf shadow-none flex flex-col justify-between group">
                        {/* Refined Vertical Indicator (Subtle 1px) */}
                        <div className={cn("absolute top-0 bottom-0 w-[1px] bg-primary/20 group-hover:bg-primary transition-all duration-700", locale === 'ar' ? "right-0" : "left-0")} />

                        <div className="relative z-10 space-y-16 text-start">
                            <div className="flex items-center gap-4 opacity-50">
                                <TransferHorizontal className="size-6 text-primary" />
                                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-wf-gray-300">{t('availableBalance')}</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-6">
                                    <span className="text-7xl md:text-9xl font-black tracking-tighter tabular-nums text-wf-near-black leading-none">
                                        {format.number(balance.walletBalance)}
                                    </span>
                                    <span className="text-3xl font-black text-primary uppercase">{t('currency')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-12 bg-primary/20" />
                                    <p className="text-[12px] text-wf-gray-300 font-black uppercase tracking-[0.3em] opacity-80">{t('verifiedEarnings')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-12 border-t border-wf-border flex flex-wrap items-center gap-10">
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-wf border border-emerald-100">
                                <div className="size-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-widest">{t('gatewayActive')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-wf-gray-300">
                                <History className="size-5 opacity-40" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t('verifiedData')}</span>
                            </div>
                        </div>

                        <Wallet className={cn("absolute -bottom-24 size-[32rem] text-primary/5 opacity-[0.04] rotate-12 group-hover:rotate-6 transition-transform duration-1000", locale === 'ar' ? "-left-24" : "-right-24")} />
                    </Card>
                )}

                {isLoading ? (
                    <Card className="lg:col-span-4 p-12 bg-slate-50/40 border-none rounded-wf flex flex-col justify-center gap-12 lg:translate-y-8">
                        <div className="space-y-8">
                            <Skeleton className="size-20 rounded-wf" />
                            <div className="space-y-3">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-12 w-48" />
                            </div>
                        </div>
                        <Skeleton className="h-20 w-full rounded-wf" />
                    </Card>
                ) : (
                    <Card className="lg:col-span-4 p-10 md:p-12 border-none bg-slate-50/40 rounded-wf shadow-none flex flex-col justify-center gap-12 group relative overflow-hidden lg:translate-y-8">
                        <div className={cn("absolute top-0 w-[1px] h-full bg-amber-500/20", locale === 'ar' ? "left-0" : "right-0")} />
                        <div className="space-y-8 text-start">
                            <div className="size-20 bg-white rounded-wf flex items-center justify-center text-amber-600 border border-wf-border shadow-none group-hover:border-amber-500/30 transition-all">
                                <PendingIcon className="size-10" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-[12px] font-black text-wf-gray-300 uppercase tracking-[0.3em] leading-none opacity-60">{t('lockedBalance')}</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-wf-near-black tabular-nums tracking-tighter leading-none">
                                        {format.number(balance.lockedBalance)}
                                    </span>
                                    <span className="text-lg font-black text-amber-600 uppercase">{t('currency')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-5 p-6 bg-white rounded-wf border border-wf-border group-hover:border-amber-500/40 transition-all relative z-10 text-start">
                            <InfoCircle className="size-6 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-wf-gray-700 font-bold uppercase tracking-widest leading-relaxed opacity-90">
                                {t('lockedDesc')}
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Staggered Ledger Composition */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 pt-8">
                {/* Transaction Audit Trace - Primary Column */}
                <div className="xl:col-span-8 space-y-10">
                    <div className={cn("flex items-center gap-4 text-start", locale === 'ar' ? "pr-4 border-r-4 border-primary/20" : "pl-4 border-l-4 border-primary/20")}>
                        <History className="size-6 text-primary" />
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-black text-wf-near-black tracking-tighter uppercase">{t('transactions.title')}</h2>
                            <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('transactions.subtitle')}</p>
                        </div>
                    </div>
                    <Card className="border-none bg-white rounded-wf shadow-none overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-start border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-wf-border">
                                        <th className="w-[45%] px-8 py-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.3em] text-start">{t('transactions.description')}</th>
                                        <th className="w-[20%] px-8 py-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.3em] text-start">{t('transactions.amount')}</th>
                                        <th className="w-[20%] px-8 py-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.3em] text-start">{t('transactions.postState')}</th>
                                        <th className={cn("w-[15%] px-8 py-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.3em]", locale === 'ar' ? "text-start" : "text-end")}>{t('transactions.date')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-wf-border">
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-8 py-10">
                                                    <div className="flex items-center gap-5">
                                                        <Skeleton className="size-12 rounded-wf" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-5 w-48" />
                                                            <Skeleton className="h-3 w-32" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-10"><Skeleton className="h-6 w-24" /></td>
                                                <td className="px-8 py-10"><Skeleton className="h-4 w-20" /></td>
                                                <td className="px-8 py-10 text-end"><Skeleton className="h-8 w-24 rounded-wf ms-auto" /></td>
                                            </tr>
                                        ))
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-32 text-center opacity-30">
                                                <div className="flex flex-col items-center gap-8">
                                                    <BillList className="size-20 text-wf-gray-300" />
                                                    <p className="font-black text-sm uppercase tracking-[0.3em] text-wf-near-black">{t('transactions.noTransactions')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tr) => (
                                            <tr key={tr.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-10 text-start">
                                                    <div className="flex items-center gap-5">
                                                        <div className={cn(
                                                            "size-12 rounded-wf flex items-center justify-center border transition-all duration-700",
                                                            tr.direction === 'credit' ? "bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:rotate-12" : "bg-red-50 text-red-600 border-red-200 group-hover:-rotate-12"
                                                        )}>
                                                            {tr.direction === 'credit' ? <DepositIcon className="size-5" /> : <PayoutIcon className="size-5" />}
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <p className="text-base font-black text-wf-near-black tracking-tight leading-none group-hover:text-primary transition-colors">{tr.note}</p>
                                                            <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] leading-none opacity-60 font-mono">Ref: {tr.id.slice(0, 12).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-10 text-start">
                                                    <div className="space-y-1.5">
                                                        <p className={cn(
                                                            "text-xl font-black tabular-nums tracking-tighter leading-none",
                                                            tr.direction === 'credit' ? "text-emerald-600" : "text-red-500"
                                                        )}>
                                                            {tr.direction === 'credit' ? '+' : '-'}{format.number(tr.amount)}
                                                        </p>
                                                        <span className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] opacity-60">{t('transactions.amountLabel')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-10 text-start">
                                                    <div className="space-y-1.5">
                                                        <p className="text-base font-black text-wf-gray-700 tabular-nums leading-none">{format.number(tr.balanceAfter)}</p>
                                                        <span className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] opacity-40">{t('transactions.runningBalance')}</span>
                                                    </div>
                                                </td>
                                                <td className={cn("px-8 py-10", locale === 'ar' ? "text-start" : "text-end")}>
                                                    <span className="text-[10px] font-black text-wf-near-black font-mono tracking-tighter bg-slate-100 px-4 py-1.5 border border-wf-border rounded-wf">
                                                        {new Date(tr.createdAt).toLocaleDateString(locale)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Payout History / Pinned Context Column */}
                <div className="xl:col-span-4 space-y-10 lg:pt-16">
                    <div className={cn("flex items-center gap-4 text-start", locale === 'ar' ? "pr-4 border-r-4 border-amber-500/20" : "pl-4 border-l-4 border-amber-500/20")}>
                        <TransferHorizontal className="size-6 text-amber-500" />
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-black text-wf-near-black tracking-tighter uppercase">{t('settlement.title')}</h2>
                            <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('settlement.subtitle')}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="p-8 space-y-8 border border-wf-border rounded-wf bg-white">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-8 w-32" />
                                        </div>
                                        <Skeleton className="h-8 w-24 rounded-wf" />
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-wf-border">
                                        <Skeleton className="h-6 w-20 rounded-wf" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </Card>
                            ))
                        ) : payouts.length === 0 ? (
                            <Card className="p-16 text-center bg-slate-50/10 border-dashed border border-wf-border rounded-wf shadow-none">
                                <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.3em] leading-relaxed opacity-40">{t('settlement.noPayouts')}</p>
                            </Card>
                        ) : (
                            payouts.map((p) => (
                                <Card key={p.id} className="p-8 border-none bg-white rounded-wf shadow-none hover:border-primary transition-all group relative overflow-hidden active:scale-[0.98] text-start">
                                    {/* Refined Vertical Indicator */}
                                    <div className={cn(
                                        "absolute top-0 bottom-0 w-[1px] transition-all group-hover:bg-current",
                                        locale === 'ar' ? "right-0" : "left-0",
                                        p.status === 'pending' ? "bg-amber-500/30" :
                                        p.status === 'processed' || p.status === 'approved' || p.status === 'sent' ? "bg-emerald-500/30" :
                                        "bg-red-500/30"
                                    )} />

                                    <div className="flex justify-between items-start mb-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-wf-gray-300 font-mono tracking-widest uppercase truncate opacity-50">Ref: {p.id.slice(-12).toUpperCase()}</p>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-3xl font-black text-wf-near-black tracking-tighter leading-none">{format.number(p.amount)}</span>
                                                <span className="text-[11px] font-black text-primary uppercase tracking-widest">{t('currency')}</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-wf text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border",
                                            p.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                            p.status === 'processed' || p.status === 'approved' || p.status === 'sent' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                            "bg-red-50 text-red-600 border-red-200"
                                        )}>
                                            <div className={cn("size-2 rounded-full bg-current", p.status === 'pending' && "animate-pulse")} />
                                            {t(`status.${p.status}`)}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-wf-border text-[10px] font-black uppercase tracking-[0.2em] text-wf-gray-300">
                                        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-wf border border-wf-border/30">
                                            {p.method === 'instapay' ? <TransferHorizontal className="size-3.5 text-primary" /> : p.method === 'bank' ? <CardTransfer className="size-3.5 text-primary" /> : <Smartphone className="size-3.5 text-primary" />}
                                            <span className="text-wf-near-black">{t(`modal.methods.${p.method}`)}</span>
                                        </div>
                                        <span className="opacity-40 font-mono">{new Date(p.createdAt).toLocaleDateString(locale)}</span>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <Portal>
                    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowRequestModal(false)}>
                        <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-xl p-0 overflow-hidden shadow-none border-none rounded-wf bg-white animate-in zoom-in-95 duration-500" data-lenis-prevent>
                            <form onSubmit={handleSubmitPayout} className="p-8 md:p-12 space-y-10 max-h-[90vh] overflow-y-auto scrollbar-hide text-start" data-lenis-prevent>
                                <div className="flex items-center justify-between pb-6 border-b border-wf-border">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl md:text-3xl font-black text-wf-near-black tracking-tighter uppercase leading-none">{t('modal.title')}</h2>
                                        <p className="text-[10px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">{t('modal.subtitle')}</p>
                                    </div>
                                    <button type="button" onClick={() => setShowRequestModal(false)} className="size-12 rounded-wf bg-slate-50 text-wf-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center border border-wf-border">
                                        <CloseCircle className="size-6" />
                                    </button>
                                </div>

                                {/* Amount Selector */}
                                <div className="p-8 bg-slate-50 rounded-wf border border-wf-border space-y-6 group focus-within:bg-white focus-within:border-primary transition-all">
                                    <div className="flex items-center justify-between text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">
                                        <span>{t('modal.withdrawalAmount')}</span>
                                        <span className="text-primary opacity-60">{t('modal.balance', { amount: format.number(balance.walletBalance) })}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-4xl font-black text-wf-near-black tracking-tighter shrink-0 opacity-10">{t('currency')}</div>
                                        <Input
                                            type="number"
                                            className="h-16 bg-transparent border-none text-5xl font-black focus:ring-0 p-0 tracking-tighter tabular-nums text-wf-near-black text-start"
                                            placeholder="00.00"
                                            value={payoutForm.amount || ''}
                                            onChange={e => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Method Switcher */}
                                <div className="flex gap-3 p-2 bg-slate-50 rounded-wf border border-wf-border">
                                    {[
                                        { id: 'instapay', icon: TransferHorizontal, label: t('modal.methods.instapay') },
                                        { id: 'bank', icon: CardTransfer, label: t('modal.methods.bank') },
                                        { id: 'wallet', icon: Smartphone, label: t('modal.methods.wallet') }
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPayoutForm({ ...payoutForm, method: method.id as any })}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-3 py-4 rounded-wf text-[10px] font-black uppercase tracking-widest transition-all border",
                                                payoutForm.method === method.id 
                                                    ? "bg-white text-primary border-primary/20 shadow-none" 
                                                    : "bg-transparent text-wf-gray-300 border-transparent hover:text-wf-near-black"
                                            )}
                                        >
                                            <method.icon className="size-4" />
                                            {method.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Destination Forms */}
                                <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                                    {payoutForm.method === 'instapay' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest flex items-center gap-2"><Globus className="size-3" /> {t('modal.instapay.address')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('modal.instapay.placeholder')} value={payoutForm.instapayDestination.identifier} onChange={e => setPayoutForm({ ...payoutForm, instapayDestination: { ...payoutForm.instapayDestination, identifier: e.target.value } })} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest flex items-center gap-2"><User className="size-3" /> {t('modal.bank.holderName')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('modal.bank.holderPlaceholder')} value={payoutForm.instapayDestination.accountHolderName} onChange={e => setPayoutForm({ ...payoutForm, instapayDestination: { ...payoutForm.instapayDestination, accountHolderName: e.target.value } })} />
                                            </div>
                                        </div>
                                    )}

                                    {payoutForm.method === 'bank' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modal.bank.name')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('modal.bank.placeholderName')} value={payoutForm.bankDestination.bankName} onChange={e => setPayoutForm({ ...payoutForm, bankDestination: { ...payoutForm.bankDestination, bankName: e.target.value } })} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modal.bank.iban')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf font-mono text-start" placeholder={t('modal.bank.ibanPlaceholder')} value={payoutForm.bankDestination.iban} onChange={e => setPayoutForm({ ...payoutForm, bankDestination: { ...payoutForm.bankDestination, iban: e.target.value } })} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modal.bank.accountNumber')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf font-mono text-start" placeholder={t('modal.bank.accountNumberPlaceholder')} value={payoutForm.bankDestination.accountNumber} onChange={e => setPayoutForm({ ...payoutForm, bankDestination: { ...payoutForm.bankDestination, accountNumber: e.target.value } })} />
                                            </div>
                                            <div className="space-y-3 md:col-span-2">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modal.bank.holderName')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('modal.bank.holderPlaceholder')} value={payoutForm.bankDestination.accountHolderName} onChange={e => setPayoutForm({ ...payoutForm, bankDestination: { ...payoutForm.bankDestination, accountHolderName: e.target.value } })} />
                                            </div>
                                        </div>
                                    )}

                                    {payoutForm.method === 'wallet' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modal.wallet.provider')}</label>
                                                <select className="w-full h-14 bg-slate-50 border border-wf-border rounded-wf outline-none font-black uppercase tracking-widest text-xs px-4 focus:bg-white focus:border-primary transition-all" value={payoutForm.walletDestination.walletProvider} onChange={e => setPayoutForm({ ...payoutForm, walletDestination: { ...payoutForm.walletDestination, walletProvider: e.target.value } })} required>
                                                    <option value="">{t('modal.wallet.selectProvider')}</option>
                                                    <option value="vodafone">VODAFONE CASH</option>
                                                    <option value="etisalat">ETISALAT CASH</option>
                                                    <option value="orange">ORANGE CASH</option>
                                                    <option value="we">WE PAY</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modal.wallet.phoneNumber')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('modal.wallet.phonePlaceholder')} value={payoutForm.walletDestination.phoneNumber} onChange={e => setPayoutForm({ ...payoutForm, walletDestination: { ...payoutForm.walletDestination, phoneNumber: e.target.value } })} />
                                            </div>
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modal.wallet.holderName')}</label>
                                                <Input required className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('modal.wallet.holderPlaceholder')} value={payoutForm.walletDestination.accountHolderName} onChange={e => setPayoutForm({ ...payoutForm, walletDestination: { ...payoutForm.walletDestination, accountHolderName: e.target.value } })} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-10 border-t border-wf-border">
                                    <Button type="button" variant="outline" className="flex-1 h-16 rounded-wf font-black uppercase tracking-widest border-wf-border hover:bg-slate-50 transition-all" onClick={() => setShowRequestModal(false)}>{t('modal.cancel')}</Button>
                                    <Button type="submit" isLoading={isSubmitting} className="flex-1 h-16 rounded-wf font-black uppercase tracking-widest bg-primary text-white shadow-none border-b-4 border-primary/20 active:border-b-0 active:translate-y-1 transition-all">
                                        {isSubmitting ? t('modal.submitting') : t('modal.submit')}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </Portal>
            )}

        </div>
    );
}
