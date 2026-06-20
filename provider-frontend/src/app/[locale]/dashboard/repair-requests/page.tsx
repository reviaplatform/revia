"use client"

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import { RepairRequest, SendOfferRequest, InspectionResultRequest, PayMethod } from '@/types/repair';
import {
  Settings,
  CheckCircle,
  CloseCircle,
  Dollar,
  Smartphone,
  History,
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const statusColors: Record<string, string> = {
  ai_assessing: 'bg-purple-100 text-purple-700 border border-purple-200',
  pending_brand_selection: 'bg-slate-100 text-slate-700 border border-slate-200',
  pending_offers: 'bg-warning-bg text-warning border border-warning-border/50',
  offer_selected: 'bg-info-bg text-info border border-info-border/50',
  inspection_pending: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  inspection_done: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  payment_pending: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
  payment_done: 'bg-teal-50 text-teal-700 border border-teal-100',
  pending_provider_repair: 'bg-blue-50 text-blue-700 border border-blue-100',
  pending_user_device_pickup: 'bg-orange-50 text-orange-700 border border-orange-100',
  completed: 'bg-success text-white shadow-sm shadow-success/20',
  cancelled: 'bg-red-50 text-red-700 border border-red-100',
};

export default function RepairRequestsPage() {
  const t = useTranslations('RepairRequests');
  const locale = useLocale();
  const [activeRequests, setActiveRequests] = useState<RepairRequest[]>([]);
  const [pendingOffers, setPendingOffers] = useState<RepairRequest[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  const fetchAll = async () => {
    setIsFetching(true);
    try {
      const [activeRes, pendingRes] = await Promise.all([
        apiClient.get('/repair-requests/active'),
        apiClient.get('/repair-requests/pending-offers'),
      ]);
      setActiveRequests(Array.isArray(activeRes.data.data) ? activeRes.data.data : activeRes.data.data?.docs || []);
      setPendingOffers(Array.isArray(pendingRes.data.data) ? pendingRes.data.data : pendingRes.data.data?.docs || []);
    } catch (error) {
      console.error('Failed to fetch repair requests', error);
      toast.error(t('statusLabels.cancelled'));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const displayedRequests = React.useMemo(() => 
    activeTab === 'active' ? activeRequests : pendingOffers,
    [activeTab, activeRequests, pendingOffers]
  );

  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-wf-border">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
              <Settings className="size-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-wf-near-black tracking-tighter uppercase leading-none text-start">
              {t('title')}
            </h1>
          </div>
          <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80 text-start">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="px-5 py-2.5 rounded-wf bg-slate-50 text-[10px] font-black uppercase tracking-widest text-wf-gray-300 border border-wf-border hover:text-primary hover:border-primary transition-all flex items-center gap-2"
        >
          <History className="size-3" />
          {t('refresh')}
        </button>
      </div>

      {/* Tabs Switchboard */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 p-1.5 bg-slate-50 border border-wf-border rounded-wf w-fit">
          {(['active', 'pending'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 rounded-wf text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-3 border",
                activeTab === tab 
                  ? "bg-white text-wf-near-black border-wf-border shadow-none" 
                  : "text-wf-gray-300 hover:text-swf-gray-700 border-transparent hover:bg-white/50"
              )}
            >
              <div className={cn(
                "size-1.5 rounded-full",
                activeTab === tab ? "bg-primary" : "bg-slate-200"
              )} />
              {tab === 'active' ? t('tabs.active') : t('tabs.pending')}
              <span className={cn(
                "ms-1 px-2 py-0.5 rounded-wf text-[9px] font-black transition-colors",
                activeTab === tab ? "bg-primary/5 text-primary" : "bg-slate-200 text-slate-500"
              )}>
                {tab === 'active' ? activeRequests.length : pendingOffers.length}
              </span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-widest opacity-40">
          <div className="flex items-center gap-2">
            <div className="size-1 bg-emerald-500 rounded-full" />
            {t('status.operational')}
          </div>
          <div className="flex items-center gap-2">
            <div className="size-1 bg-blue-500 rounded-full" />
            {t('status.synced')}
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-8 space-y-8 border border-wf-border rounded-wf shadow-none">
              <div className="flex justify-between items-start">
                <div className="space-y-2 text-start">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-6 w-24 rounded-wf" />
              </div>
              <Skeleton className="h-24 w-full rounded-wf" />
              <div className="flex justify-between items-end border-t border-wf-border pt-6">
                <Skeleton className="h-10 w-28 rounded-wf" />
                <div className="space-y-2 text-end">
                  <Skeleton className="h-2 w-16 ms-auto" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : displayedRequests.length === 0 ? (
        <Card className="p-24 text-center border-dashed border-2 border-slate-100 bg-slate-50/20 rounded-wf shadow-none">
          <div className="flex flex-col items-center gap-6 opacity-30">
            <Smartphone className="size-16 text-wf-gray-300" />
            <p className="font-black text-xs uppercase tracking-widest text-wf-near-black">{t('noData')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedRequests.map((req, index) => (
            <RepairRequestCard 
              key={req.id} 
              req={req} 
              index={index} 
            />
          ))}
        </div>
      )}
    </div>
  );
}


const RepairRequestCard = React.memo(({ req, index }: { req: RepairRequest; index: number }) => {
  const t = useTranslations('RepairRequests');
  const locale = useLocale();

  return (
    <Card
      className={cn(
        "p-8 space-y-8 border border-wf-border bg-white rounded-wf shadow-none hover:border-primary transition-all duration-500 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4",
        index === 0 && "lg:col-span-2"
      )}
      style={{ 
        animationDelay: `${index * 100}ms`,
        willChange: 'transform, opacity'
      }}
    >
      <div className={cn(
        "absolute top-0 bottom-0 w-[1px] transition-all group-hover:bg-current",
        locale === 'ar' ? "right-0" : "left-0",
        statusColors[req.status]?.split(' ')[0].replace('bg-', 'bg-') || 'bg-slate-200'
      )} />

      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1 text-start">
          <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em] opacity-60">ID: {req.id.slice(-8).toUpperCase()}</p>
          <h3 className="font-black text-wf-near-black text-2xl tracking-tighter leading-none group-hover:text-primary transition-colors">
            {req.device?.manufacturer || t('generic')}
            <span className="ms-2 text-wf-gray-300 font-bold">{req.device?.deviceModel || t('terminal')}</span>
          </h3>
        </div>
        <div className={cn(
          "shrink-0 px-3 py-1.5 rounded-wf text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all duration-500",
          statusColors[req.status] || 'bg-slate-50 text-wf-gray-300 border-wf-border'
        )}>
          <div className={cn("size-1.5 rounded-full bg-current", req.status !== 'completed' && req.status !== 'cancelled' && "animate-pulse")} />
          {t(`statusLabels.${req.status}`) || req.status.replace(/_/g, ' ')}
        </div>
      </div>

      {req.issueText && (
        <div className="p-5 bg-slate-50 border border-wf-border rounded-wf group-hover:bg-white transition-colors relative overflow-hidden text-start">
          <div className={cn("absolute top-0 p-2 opacity-5", locale === 'ar' ? "left-0" : "right-0")}>
            <History className="size-12" />
          </div>
          <p className="text-[11px] text-wf-gray-700 font-black uppercase tracking-wider leading-relaxed line-clamp-2">
            {req.issueText}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-wf-border">
        <Link href={`/dashboard/repair-requests/${req.id}`}>
          <Button className="h-10 rounded-wf px-6 font-black text-[10px] uppercase tracking-widest bg-wf-near-black text-white hover:bg-primary transition-all shadow-none border-b-2 border-transparent active:border-b-0 active:translate-y-0.5">
            {t('viewDetails')}
          </Button>
        </Link>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest opacity-40">{t('registered')}</span>
          <p className="text-[10px] font-black text-wf-near-black font-mono">
            {new Date(req.createdAt).toLocaleDateString(locale)}
          </p>
        </div>
      </div>
    </Card>
  );
});

RepairRequestCard.displayName = 'RepairRequestCard';
