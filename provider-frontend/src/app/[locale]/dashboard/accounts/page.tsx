"use client"

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
    UsersGroupTwoRounded,
    AddCircle,
    TrashBinMinimalistic as BanIcon,
    CheckCircle,
    CloseCircle,
    ShieldCheck,
    User,
    Letter,
    Phone,
    Lock,
    Globus,
    Magnifer,
    InfoCircle
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Portal } from '@/components/ui/Portal';
import { useTranslations, useLocale } from 'next-intl';

interface Account {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    lastLoginAt: string | null;
    deletedAt: string | null;
    role: string;
    languagePreference: string;
    createdAt: string;
    brand: { en: string; ar: string } | null;
}

export default function AccountsPage() {
    const t = useTranslations('Accounts');
    const locale = useLocale();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({
        name: '', email: '', phoneNumber: '', role: 'owner', password: '', languagePreference: 'en'
    });

    // Confirm Modal State
    const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'ban' | 'unban' } | null>(null);

    const fetchAccounts = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/account/list?page=1&limit=20');
            setAccounts(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
            toast.error(t('messages.loadError') || 'Could not load account members');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await apiClient.post('/account/create', createForm);
            toast.success(t('messages.createSuccess'));
            setShowCreateModal(false);
            setCreateForm({ name: '', email: '', phoneNumber: '', role: 'owner', password: '', languagePreference: 'en' });
            fetchAccounts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('messages.createError'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleBanAction = async () => {
        if (!confirmAction) return;
        setProcessingId(confirmAction.id);
        try {
            if (confirmAction.type === 'ban') {
                await apiClient.delete(`/account/${confirmAction.id}/ban`);
                toast.success(t('messages.banSuccess'));
            } else {
                await apiClient.post(`/account/${confirmAction.id}/unban`);
                toast.success(t('messages.unbanSuccess'));
            }
            fetchAccounts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('messages.actionError'));
        } finally {
            setConfirmAction(null);
            setProcessingId(null);
        }
    };

    const filteredAccounts = React.useMemo(() =>
        accounts.filter(acc =>
            acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            acc.email.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [accounts, searchQuery]
    );

    return (
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-wf-border">
                <div className="space-y-2 text-start">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
                            <ShieldCheck className="size-6" />
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
                    onClick={() => setShowCreateModal(true)}
                    className="h-14 rounded-wf px-10 font-black bg-primary hover:bg-primary/90 text-white shadow-none border-b-4 border-primary/20 transition-all active:border-b-0 active:translate-y-1"
                >
                    <AddCircle className={cn("size-5", locale === 'ar' ? "ml-3" : "mr-3")} />
                    {t('createButton')}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:max-w-md group">
                    <Input
                        placeholder={t('filterPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "h-14 rounded-wf bg-slate-50 border-wf-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black uppercase tracking-widest text-start",
                            locale === 'ar' ? "pr-12" : "pl-12"
                        )}
                    />
                    <Magnifer className={cn(
                        "absolute top-1/2 -translate-y-1/2 size-5 text-wf-gray-300 group-focus-within:text-primary transition-colors",
                        locale === 'ar' ? "right-4" : "left-4"
                    )} />
                </div>
            </div>

            <Card className="border border-wf-border overflow-hidden bg-white rounded-wf shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-wf-border">
                                <th className="w-[30%] px-6 py-5 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] text-start">{t('columns.member')}</th>
                                <th className="w-[15%] px-6 py-5 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] text-start">{t('columns.role')}</th>
                                <th className="w-[20%] px-6 py-5 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] text-start">{t('columns.contact')}</th>
                                <th className="w-[15%] px-6 py-5 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] text-start">{t('columns.lastActive')}</th>
                                <th className="w-[20%] px-6 py-5 text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] text-end">{t('columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-wf-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="size-12 rounded-wf" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-40" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8"><Skeleton className="h-8 w-24 rounded-wf" /></td>
                                        <td className="px-6 py-8"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-8">
                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-16" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-end"><Skeleton className="h-10 w-32 rounded-wf ms-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <UsersGroupTwoRounded className="size-16 text-wf-gray-300" />
                                            <p className="font-black text-wf-near-black tracking-widest uppercase text-xs">{t('noResults')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((acc) => (
                                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-all group relative">
                                        <td className="px-6 py-8 relative">
                                            <div className={cn(
                                                "absolute top-0 bottom-0 w-[1px] transition-all",
                                                locale === 'ar' ? "right-0" : "left-0",
                                                acc.role === 'owner' ? "bg-amber-500/50" : "bg-primary/50"
                                            )} />

                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-12 rounded-wf flex items-center justify-center font-black text-xl border transition-all duration-500",
                                                    acc.role === 'owner' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary/5 text-primary border-primary/20"
                                                )}>
                                                    {acc.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-1 text-start">
                                                    <p className="text-lg font-black text-wf-near-black tracking-tighter leading-none group-hover:text-primary transition-colors">{acc.name}</p>
                                                    <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest leading-none opacity-60">{acc.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-start">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-wf text-[10px] font-black uppercase tracking-widest border inline-flex",
                                                acc.role === 'owner' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                            )}>
                                                {acc.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-8 text-start">
                                            <div className="flex items-center gap-2">
                                                <Phone className="size-3 text-wf-gray-300" />
                                                <span className="text-[11px] font-black text-wf-near-black font-mono tracking-tight">{acc.phoneNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest opacity-60">{t('lastActive')}</p>
                                                <p className="text-xs font-black text-wf-near-black tracking-tight leading-none">
                                                    {acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleDateString(locale) : t('neverActive')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-end">
                                            {acc.deletedAt ? (
                                                <Button
                                                    onClick={() => setConfirmAction({ id: acc.id, type: 'unban' })}
                                                    isLoading={processingId === acc.id}
                                                    disabled={!!processingId}
                                                    className="h-10 px-6 rounded-wf text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-none"
                                                >
                                                    {t('restore')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => setConfirmAction({ id: acc.id, type: 'ban' })}
                                                    isLoading={processingId === acc.id}
                                                    disabled={!!processingId}
                                                    className="h-10 px-6 rounded-wf text-[10px] font-black uppercase tracking-widest bg-red-50/50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-none opactity-80 hover:opacity-100"
                                                >
                                                    {t('ban')}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Modal */}
            {showCreateModal && (
                <Portal>
                    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)}>
                        <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-xl p-0 overflow-hidden shadow-none border border-wf-border rounded-wf bg-white animate-in zoom-in-95 duration-500" data-lenis-prevent>
                            <form onSubmit={handleCreateAccount} className="p-8 md:p-12 space-y-10">
                                <div className="flex items-center justify-between pb-6 border-b border-wf-border">
                                    <div className="space-y-1 text-start">
                                        <h2 className="text-2xl md:text-3xl font-black text-wf-near-black tracking-tighter uppercase leading-none">{t('createModal.title')}</h2>
                                        <p className="text-[10px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">{t('createModal.subtitle')}</p>
                                    </div>
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="size-12 rounded-wf bg-slate-50 text-wf-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center border border-wf-border">
                                        <CloseCircle className="size-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                    <div className="space-y-3 text-start">
                                        <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest flex items-center gap-2 leading-none"><User className="size-3" /> {t('createModal.fullName')}</label>
                                        <Input className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder="Ex: MARCUS AURELIUS" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-3 text-start">
                                        <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest flex items-center gap-2 leading-none"><Letter className="size-3" /> {t('createModal.email')}</label>
                                        <Input type="email" className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder="MEMBER@BRAND.COM" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-3 text-start">
                                        <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest flex items-center gap-2 leading-none"><Phone className="size-3" /> {t('createModal.phone')}</label>
                                        <Input className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder="+20 1XX XXX XXXX" value={createForm.phoneNumber} onChange={e => setCreateForm({ ...createForm, phoneNumber: e.target.value })} required />
                                    </div>
                                    <div className="space-y-3 text-start">
                                        <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest flex items-center gap-2 leading-none"><Lock className="size-3" /> {t('createModal.password')}</label>
                                        <Input type="password" title="At least 6 characters" className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder="********" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required minLength={6} />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <Button type="button" variant="outline" className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest border-wf-border hover:bg-slate-50" onClick={() => setShowCreateModal(false)}>{t('createModal.cancel')}</Button>
                                    <Button type="submit" isLoading={isCreating} className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest bg-primary text-white shadow-none">{t('createModal.submit')}</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </Portal>
            )}

            {/* Confirm Ban/Unban Modal */}
            {confirmAction && (
                <Portal>
                    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmAction(null)}>
                        <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-md p-10 text-center space-y-8 rounded-wf border border-wf-border shadow-none animate-in zoom-in-95 bg-white" data-lenis-prevent>
                            <div className={cn(
                                "size-20 mx-auto rounded-wf flex items-center justify-center shrink-0 border transition-all duration-700",
                                confirmAction.type === 'ban' ? "bg-red-600 border-red-400 text-white" : "bg-emerald-600 border-emerald-400 text-white"
                            )}>
                                {confirmAction.type === 'ban' ? <BanIcon className="size-10" /> : <CheckCircle className="size-10" />}
                            </div>
                            <div className="space-y-3">
                                <h3 className={cn(
                                    "text-2xl font-black tracking-tighter uppercase leading-none",
                                    confirmAction.type === 'ban' ? "text-red-900" : "text-emerald-900"
                                )}>
                                    {confirmAction.type === 'ban' ? t('confirmModal.suspend') : t('confirmModal.restore')}
                                </h3>
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-60 leading-relaxed px-4 text-wf-gray-700">
                                    {confirmAction.type === 'ban'
                                        ? t('confirmModal.suspendSubtitle')
                                        : t('confirmModal.restoreSubtitle')
                                    }
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest bg-white border-wf-border" onClick={() => setConfirmAction(null)}>{t('confirmModal.abort')}</Button>
                                <Button
                                    onClick={handleBanAction}
                                    isLoading={!!processingId}
                                    className={cn(
                                        "flex-1 h-14 rounded-wf font-black uppercase tracking-widest text-white shadow-none",
                                        confirmAction.type === 'ban' ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                                    )}
                                >
                                    {t('confirmModal.confirm')}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </Portal>
            )}
        </div>
    );
}
