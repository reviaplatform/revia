'use client';

import React, { useState } from 'react';
import { Portal } from '@/components/ui/Portal';
import {
    ChatRoundLine,
    AddCircle,
    ClockCircle,
    InfoCircle,
    AltArrowRight,
    Magnifer,
    QuestionCircle,
    Hashtag,
    ShieldCheck,
    CloseCircle
} from '@solar-icons/react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSupport } from '@/hooks/useSupport';
import { SupportTicketStatus, SupportTicketPriority } from '@/types/support';
import { useTranslations, useLocale } from 'next-intl';

export default function SupportPage() {
    const t = useTranslations('Support');
    const locale = useLocale();
    const { tickets, isLoading, isCreating, createTicket } = useSupport();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        message: '',
        priority: 'MEDIUM'
    });

    const filteredTickets = tickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTicket(newTicket);
            setNewTicket({ subject: '', message: '', priority: 'MEDIUM' });
            setIsSheetOpen(false);
        } catch {
            // Error handled in hook
        }
    };

    const getStatusColor = (status: SupportTicketStatus) => {
        switch (status) {
            case SupportTicketStatus.OPEN: return 'bg-blue-50/50 text-blue-600 border-blue-100';
            case SupportTicketStatus.IN_PROGRESS: return 'bg-amber-50/50 text-amber-600 border-amber-100';
            case SupportTicketStatus.RESOLVED: return 'bg-emerald-50/50 text-emerald-600 border-emerald-100';
            case SupportTicketStatus.CLOSED: return 'bg-slate-50/50 text-slate-400 border-slate-100';
            default: return 'bg-slate-50/50 text-slate-600 border-slate-100';
        }
    };

    const getPriorityColor = (priority: SupportTicketPriority) => {
        switch (priority) {
            case SupportTicketPriority.HIGH: return 'text-rose-500';
            case SupportTicketPriority.MEDIUM: return 'text-amber-500';
            case SupportTicketPriority.LOW: return 'text-emerald-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            {/* Header Registry Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-wf-border">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
                            <ChatRoundLine className="size-6" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
                            {t('title')} <span className="text-primary italic">{t('titleAccent')}</span>
                        </h1>
                    </div>
                    <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
                        {t('subtitle')}
                    </p>
                </div>

                <Button 
                    onClick={() => setIsSheetOpen(true)}
                    className="h-14 px-8 rounded-wf font-black bg-primary text-white shadow-none border-b-4 border-primary/20 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <AddCircle className={cn("size-5", locale === 'ar' ? "ml-3" : "mr-3")} />
                    {t('newTicket')}
                </Button>

                {isSheetOpen && (
                    <Portal>
                        <div 
                            dir={locale === 'ar' ? 'rtl' : 'ltr'} 
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setIsSheetOpen(false)}
                        >
                            <Card 
                                onClick={(e) => e.stopPropagation()} 
                                className="w-full max-w-xl p-6 sm:p-10 space-y-6 rounded-wf border border-wf-border bg-white shadow-none animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto"
                                data-lenis-prevent
                            >
                                <button
                                    onClick={() => setIsSheetOpen(false)}
                                    className={cn(
                                        "absolute top-6 size-8 flex items-center justify-center rounded-wf hover:bg-slate-100 transition-colors text-wf-gray-300 hover:text-wf-near-black",
                                        locale === 'ar' ? "left-6" : "right-6"
                                    )}
                                    type="button"
                                >
                                    <CloseCircle className="size-5" />
                                </button>
                                
                                <div className="p-0 pb-6 border-b border-wf-border text-start">
                                    <div className="size-12 bg-primary/10 rounded-wf flex items-center justify-center mb-6">
                                        <AddCircle className="size-6 text-primary" />
                                    </div>
                                    <h3 className="text-3xl font-black text-wf-near-black tracking-tighter uppercase leading-none">{t('modal.title')}</h3>
                                    <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] mt-2">
                                        {t('modal.subtitle')}
                                    </p>
                                </div>
                                <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-between text-start">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-wf-near-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Hashtag className="size-3 text-primary" />
                                                {t('modal.subject')}
                                            </label>
                                            <Input
                                                className="h-12 rounded-wf border border-wf-border bg-slate-50 px-4 text-sm font-medium transition-all"
                                                placeholder={t('modal.subjectPlaceholder')}
                                                required
                                                value={newTicket.subject}
                                                onChange={e => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-wf-near-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ShieldCheck className="size-3 text-primary" />
                                                {t('modal.priority')}
                                            </label>
                                            <Select
                                                value={newTicket.priority}
                                                onValueChange={(val: SupportTicketPriority) => setNewTicket(prev => ({ ...prev, priority: val }))}
                                            >
                                                <SelectTrigger className="h-12 bg-slate-50 border-wf-border rounded-wf font-black uppercase tracking-widest text-[10px] shadow-none focus:border-primary focus:ring-[4px] focus:ring-primary/10">
                                                    <SelectValue placeholder="Select Impact Level" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-wf border-wf-border shadow-xl">
                                                    <SelectItem value="LOW" className="py-3 font-bold uppercase tracking-widest text-emerald-600">{t('priorities.LOW')}</SelectItem>
                                                    <SelectItem value="MEDIUM" className="py-3 font-bold uppercase tracking-widest text-amber-600">{t('priorities.MEDIUM')}</SelectItem>
                                                    <SelectItem value="HIGH" className="py-3 font-bold uppercase tracking-widest text-rose-600">{t('priorities.HIGH')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-wf-near-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ChatRoundLine className="size-3 text-primary" />
                                                {t('modal.message')}
                                            </label>
                                            <textarea
                                                className="w-full min-h-[180px] rounded-wf border border-wf-border bg-slate-50 px-4 py-4 text-sm font-medium transition-all outline-none focus:border-primary focus:ring-[4px] focus:ring-primary/10 resize-none leading-relaxed"
                                                placeholder={t('modal.messagePlaceholder')}
                                                required
                                                value={newTicket.message}
                                                onChange={e => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-6 flex gap-4 mt-8">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsSheetOpen(false)}
                                            className="flex-1 h-12 rounded-wf font-black text-[10px] uppercase tracking-widest border border-wf-border text-wf-near-black hover:bg-slate-50"
                                        >
                                            {t('modal.cancel')}
                                        </button>
                                        <Button
                                            type="submit"
                                            className="flex-[2] h-12 bg-wf-near-black text-white rounded-wf font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all"
                                            disabled={isCreating}
                                        >
                                            {isCreating ? t('modal.submitting') : t('modal.submit')}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </Portal>
                )}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Tickets Registry Column */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 px-1">
                            <div className="size-1.5 rounded-full bg-primary" />
                            <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.3em]">
                                {t('totalActivity', { count: filteredTickets.length })}
                            </p>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Input 
                                placeholder={t('filterPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    "h-14 rounded-wf bg-slate-50 border-wf-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black uppercase tracking-widest",
                                    locale === 'ar' ? "pr-12" : "pl-12"
                                )}
                            />
                            <Magnifer className={cn(
                                "absolute top-1/2 -translate-y-1/2 size-5 text-wf-gray-300 group-focus-within:text-primary transition-colors",
                                locale === 'ar' ? "right-4" : "left-4"
                            )} />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="p-8 space-y-6 border border-wf-border bg-white rounded-wf">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-6 w-20 rounded-wf" />
                                                <Skeleton className="h-6 w-24 rounded-wf" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-8 w-3/4" />
                                                <Skeleton className="h-12 w-full rounded-wf" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <Card className="p-24 text-center border-dashed border-2 border-slate-100 bg-slate-50/20 rounded-wf shadow-none">
                            <div className="flex flex-col items-center gap-6 opacity-30">
                                <ChatRoundLine className="size-16 text-wf-gray-300" />
                                <p className="font-black text-wf-gray-300 tracking-widest uppercase text-xs">{t('noResults')}</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {filteredTickets.map((ticket, i) => (
                                <Card
                                    key={ticket.id}
                                    className="p-8 space-y-6 border border-wf-border bg-white rounded-wf shadow-none hover:border-primary transition-all duration-500 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className={cn("absolute top-0 bottom-0 w-[1px] bg-slate-200 group-hover:bg-primary transition-all", locale === 'ar' ? "right-0" : "left-0")} />

                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="space-y-4 flex-1 text-start min-w-0">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest opacity-60">
                                                    ID: {ticket.id.slice(-8).toUpperCase()}
                                                </span>
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-wf text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all",
                                                    getStatusColor(ticket.status)
                                                )}>
                                                    <div className={cn("size-1.5 rounded-full bg-current", (ticket.status === SupportTicketStatus.OPEN || ticket.status === SupportTicketStatus.IN_PROGRESS) && "animate-pulse")} />
                                                    {t(`status.${ticket.status}`)}
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-wf border border-wf-border">
                                                    <div className={cn("size-1.5 rounded-full shadow-[0_0_8px_currentColor]", ticket.priority === 'HIGH' ? 'bg-rose-500 text-rose-500' : ticket.priority === 'MEDIUM' ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500')} />
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", getPriorityColor(ticket.priority))}>
                                                        {t(`priorities.${ticket.priority}`)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-black text-wf-near-black tracking-tighter uppercase group-hover:text-primary transition-colors">
                                                    {ticket.subject}
                                                </h4>
                                                <p className="text-xs text-wf-gray-700 font-black uppercase tracking-wider leading-relaxed opacity-80 break-words">
                                                    {ticket.message}
                                                </p>

                                                {ticket.adminNote && (
                                                    <div className="mt-6 p-6 bg-primary/[0.03] border border-primary/10 rounded-wf relative overflow-hidden">
                                                        <div className={cn("absolute top-0 p-2 opacity-5", locale === 'ar' ? "left-0" : "right-0")}>
                                                            <ClockCircle className="size-16" />
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                                                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{t('ourResponse')}</span>
                                                        </div>
                                                        <p className="text-xs font-black text-wf-near-black uppercase tracking-wide leading-relaxed relative z-10 italic break-words">
                                                            &quot;{ticket.adminNote}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={cn("flex md:flex-col items-center justify-between md:justify-start gap-1 shrink-0", locale === 'ar' ? "md:items-start" : "md:items-end")}>
                                            <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest opacity-40">{t('registeredDate')}</p>
                                            <p className="text-[10px] font-black text-wf-near-black font-mono">
                                                {new Date(ticket.createdAt).toLocaleDateString(locale)}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Administrative Controls Column */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
                    {/* Help Center Registry */}
                    <Card className="p-8 border border-primary bg-primary text-white rounded-wf shadow-lg shadow-primary/20 space-y-8 overflow-hidden group">
                        <div className="flex items-center gap-3 border-b border-white/20 pb-6 text-white">
                            <div className="size-8 bg-white/20 rounded-wf flex items-center justify-center">
                                <QuestionCircle className="size-4" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-widest !text-white">{t('sidebar.title')}</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-white/60 uppercase tracking-widest leading-relaxed">
                                {t('sidebar.description')}
                            </p>
                            <div className="space-y-2">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-wf flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group/link">
                                    <div className="flex items-center gap-3">
                                        <InfoCircle className="size-4 text-white/40" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('sidebar.guides')}</span>
                                    </div>
                                    <AltArrowRight className={cn("size-3 transition-transform", locale === 'ar' ? "group-hover/link:-translate-x-1 rotate-180" : "group-hover/link:translate-x-1")} />
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-wf flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group/link">
                                    <div className="flex items-center gap-3">
                                        <InfoCircle className="size-4 text-white/40" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('sidebar.faq')}</span>
                                    </div>
                                    <AltArrowRight className={cn("size-3 transition-transform", locale === 'ar' ? "group-hover/link:-translate-x-1 rotate-180" : "group-hover/link:translate-x-1")} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
