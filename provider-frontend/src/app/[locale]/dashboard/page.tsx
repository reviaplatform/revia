'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Tuning,
  AltArrowUp,
  AltArrowDown,
  UsersGroupTwoRounded,
  Star,
  Hashtag,
  CheckCircle,
  ClockCircle,
  NotificationUnreadLines,
  GraphUp,
  GraphDown,
  CardSend,
  Ticket,
  CalendarMinimalistic,
  InfoCircle,
  HandMoney,
  ChatLine,
  Eye,
  Settings
} from '@solar-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { AnalyticsResponse, AnalyticsPeriod, AnalyticsOverview } from '@/types/analytics';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useTranslations, useLocale, useFormatter } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const format = useFormatter();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [data, setData] = useState<AnalyticsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  const fetchAnalytics = useCallback(async (selectedPeriod: AnalyticsPeriod) => {
    setLoading(true);
    try {
      const response = await apiClient.get<AnalyticsResponse>(`/analytics?period=${selectedPeriod}`);
      if (response.data.status === 'success') {
        setData(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error(error.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-black text-wf-gray-300 uppercase tracking-widest animate-pulse">{t('synchronizing')}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, repairRequests, revenue, offers, reviews, payouts, subscription, support } = data;

  const kpis = [
    {
      title: t('kpis.walletBalance'),
      value: format.number(overview.walletBalance, { style: 'currency', currency: 'EGP' }),
      subValue: `${t('kpis.locked')}: ${format.number(overview.lockedBalance, { style: 'currency', currency: 'EGP' })}`,
      icon: Wallet,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: t('kpis.totalRevenue'),
      value: format.number(overview.totalRevenue, { style: 'currency', currency: 'EGP' }),
      subValue: t('kpis.selectedPeriod'),
      icon: HandMoney,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-600',
    },
    {
      title: t('kpis.activeRepairs'),
      value: overview.activeRepairs.toString(),
      subValue: `${overview.completedRepairs} ${t('kpis.completedAllTime')}`,
      icon: Tuning,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-600',
    },
    {
      title: t('kpis.avgRating'),
      value: overview.averageRating.toFixed(1),
      subValue: t('kpis.fromReviews', { count: overview.totalReviews }),
      icon: Star,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-600',
    },
  ];


  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-10">
      {/* Header Section */}
      <div className="pb-8 border-b border-wf-border flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
              <GraphUp className="size-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
              {t('title')}
            </h1>
          </div>
          <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1 p-1 bg-slate-50 rounded-wf border border-wf-border">
            {(['7d', '30d', '90d', '1y', 'all'] as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 rounded-wf text-[10px] font-black uppercase tracking-widest transition-all",
                  period === p 
                    ? "bg-white text-primary shadow-sm border border-wf-border" 
                    : "text-wf-gray-300 hover:text-wf-near-black"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-wf-border rounded-wf text-[11px] font-black text-wf-near-black uppercase tracking-widest shadow-sm">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
            {t('liveSync')}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-wf-border bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <Skeleton className="size-12 rounded-wf" />
                  <Skeleton className="h-5 w-14 rounded-wf" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi, i) => (
            <Card key={i} className="border border-wf-border hover:translate-x-1 hover:-translate-y-1 transition-all duration-500 group overflow-hidden bg-white">
              <CardContent className="p-5 md:p-6 relative">
                <div className={cn(
                  "absolute size-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out",
                  locale === 'ar' ? "-left-6 -bottom-6" : "-right-6 -bottom-6"
                )} />
                <div className="flex items-start justify-between relative z-10">
                  <div className={cn("p-3 rounded-wf transition-transform group-hover:scale-110 duration-500", kpi.lightColor)}>
                    <kpi.icon className="size-6 md:size-7" />
                  </div>
                </div>
                <div className="mt-5 relative z-10 text-start">
                  <p className="text-[11px] font-black text-wf-gray-300 uppercase tracking-widest">{kpi.title}</p>
                  <h3 className="text-2xl md:text-3xl font-black text-wf-near-black mt-1 tracking-tighter">{kpi.value}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{kpi.subValue}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue & Repair Timeline Combined */}
        <Card className="xl:col-span-2 border border-wf-border overflow-hidden bg-white group/card rounded-wf">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-50 p-6 md:p-8 space-y-4 sm:space-y-0">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/10 rounded-wf flex items-center justify-center text-primary group-hover/card:rotate-12 transition-transform">
                <HandMoney className="size-5" />
              </div>
              <CardTitle className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase text-start">{t('revenueFlow.title')}</CardTitle>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-primary rounded-full" />
                <span className="text-[9px] font-black text-wf-gray-300 uppercase">{t('revenueFlow.credit')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 bg-red-500 rounded-full" />
                <span className="text-[9px] font-black text-wf-gray-300 uppercase">{t('revenueFlow.debit')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {loading ? (
              <div className="space-y-8">
                <div className="h-72 flex items-end gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-wf" style={{ height: `${Math.random() * 60 + 20}%` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="p-5 bg-slate-50 rounded-wf border border-wf-border relative overflow-hidden group/item text-start">
                    <div className={cn("absolute top-[-10px] size-16 bg-emerald-500/5 rounded-full group-hover/item:scale-150 transition-transform duration-500", locale === 'ar' ? "left-[-10px]" : "right-[-10px]")} />
                    <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest mb-1 relative z-10">{t('revenueFlow.onlinePayments')}</p>
                    <h4 className="text-2xl font-black text-wf-near-black relative z-10">{format.number(revenue.byType.booking_online, { style: 'currency', currency: 'EGP' })}</h4>
                    <div className="mt-2 flex items-center gap-1 relative z-10">
                      <div className="size-1.5 bg-emerald-500 rounded-full" />
                      <p className="text-[9px] text-emerald-600 font-black uppercase">{t('revenueFlow.netRevenue')}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-wf border border-wf-border relative overflow-hidden group/item text-start">
                    <div className={cn("absolute top-[-10px] size-16 bg-amber-500/5 rounded-full group-hover/item:scale-150 transition-transform duration-500", locale === 'ar' ? "left-[-10px]" : "right-[-10px]")} />
                    <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest mb-1 relative z-10">{t('revenueFlow.cashPos')}</p>
                    <h4 className="text-2xl font-black text-wf-near-black relative z-10">{format.number(revenue.byType.booking_cash_pos, { style: 'currency', currency: 'EGP' })}</h4>
                    <div className="mt-2 flex items-center gap-1 relative z-10">
                      <div className="size-1.5 bg-amber-500 rounded-full" />
                      <p className="text-[9px] text-amber-600 font-black uppercase">{t('revenueFlow.grossVolume')}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-wf border border-wf-border relative overflow-hidden group/item text-start">
                    <div className={cn("absolute top-[-10px] size-16 bg-blue-500/5 rounded-full group-hover/item:scale-150 transition-transform duration-500", locale === 'ar' ? "left-[-10px]" : "right-[-10px]")} />
                    <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest mb-1 relative z-10">{t('revenueFlow.totalPayouts')}</p>
                    <h4 className="text-2xl font-black text-wf-near-black relative z-10">{format.number(revenue.byType.payout_sent, { style: 'currency', currency: 'EGP' })}</h4>
                    <div className="mt-2 flex items-center gap-1 relative z-10">
                      <div className="size-1.5 bg-blue-500 rounded-full" />
                      <p className="text-[9px] text-blue-600 font-black uppercase">{t('revenueFlow.disbursed')}</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar touch-pan-x">
                  <div className="min-w-[600px] md:min-w-0 h-72 flex items-end justify-between gap-2.5 md:gap-4 lg:gap-6 relative group/timeline">
                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between h-full pointer-events-none z-0">
                      {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-px bg-slate-50" />)}
                    </div>

                    {revenue.timeline.length > 0 ? (
                      revenue.timeline.map((point, i) => {
                        const maxVal = Math.max(...revenue.timeline.map(p => Math.max(p.credit, p.debit)), 1);
                        return (
                          <div key={i} className="group relative flex-1 h-full flex flex-col justify-end z-10">
                            <div className="flex gap-1 items-end h-full w-full">
                              <div
                                className="flex-1 bg-primary/20 group-hover:bg-primary transition-all duration-500 rounded-t-sm relative"
                                style={{ height: `${(point.credit / maxVal) * 100}%` }}
                              >
                                <div className="absolute inset-x-0 top-0 h-1 bg-primary/20" />
                              </div>
                              {point.debit > 0 && (
                                <div
                                  className="flex-1 bg-red-100 group-hover:bg-red-500 transition-all duration-500 rounded-t-sm"
                                  style={{ height: `${(point.debit / maxVal) * 100}%` }}
                                />
                              )}
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-wf-near-black text-white p-3 rounded-wf text-[10px] font-black opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-y-2 group-hover:translate-y-0 z-20 whitespace-nowrap shadow-2xl border border-white/10">
                              <p className="text-primary mb-1 border-b border-white/10 pb-1">{point.date}</p>
                              <div className="flex justify-between gap-4 mt-1">
                                <span className="opacity-60 uppercase">{t('revenueFlow.credit')}:</span>
                                <span>{format.number(point.credit, { style: 'currency', currency: 'EGP' })}</span>
                              </div>
                              {point.debit > 0 && (
                                <div className="flex justify-between gap-4 mt-0.5">
                                  <span className="text-red-400 uppercase">{t('revenueFlow.debit')}:</span>
                                  <span>{format.number(point.debit, { style: 'currency', currency: 'EGP' })}</span>
                                </div>
                              )}
                            </div>
                            <span className="mt-4 text-[9px] font-black text-slate-400 text-center uppercase truncate">
                              {point.date.split('-').slice(1).join('/')}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-wf border border-dashed border-wf-border">
                        <HandMoney className="size-10 text-wf-gray-300 opacity-20" />
                        <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('revenueFlow.noData')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Repair Flow & Status */}
        <div className="space-y-6 md:space-y-8">
          <Card className="border border-wf-border flex flex-col bg-white overflow-hidden rounded-wf shadow-sm">
            <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/5 rounded-wf text-primary">
                  <NotificationUnreadLines className="size-6" />
                </div>
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight uppercase">{t('workflow.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col text-start">
              <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50/30 border-b border-slate-50">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('workflow.directVolume')}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-wf-near-black leading-none">{repairRequests.byFlow.direct}</span>
                    <span className="text-[10px] font-black text-primary mb-0.5">{t('workflow.units')}</span>
                  </div>
                </div>
                <div className={cn("space-y-1 ms-6", locale === 'ar' ? "border-r border-slate-200 pr-6" : "border-l border-slate-200 pl-6")}>
                  <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('workflow.aiAssisted')}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-wf-near-black leading-none">{repairRequests.byFlow.ai_chat}</span>
                    <span className="text-[10px] font-black text-purple-600 mb-0.5">{t('workflow.units')}</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[360px] custom-scrollbar">
                {Object.entries(repairRequests.byStatus).map(([status, count]) => (
                  <div key={status} className="p-4 px-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "size-2 rounded-full",
                        status === 'completed' ? 'bg-emerald-500' : 
                        status === 'cancelled' ? 'bg-red-500' :
                        status.includes('pending') ? 'bg-amber-500' : 'bg-blue-500'
                      )} />
                      <span className="text-[10px] font-black text-wf-near-black uppercase tracking-widest">{status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(count / Math.max(...Object.values(repairRequests.byStatus), 1)) * 100}%` }} />
                      </div>
                      <span className="text-sm font-black text-slate-400 group-hover:text-primary transition-colors min-w-[20px] text-start">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-wf-border bg-slate-50/50">
              <Link href="/dashboard/repair-requests" className="w-full py-4 text-[10px] font-black text-wf-near-black hover:bg-wf-near-black hover:text-white rounded-wf transition-all uppercase tracking-widest border border-wf-border inline-block text-center">
                {t('workflow.viewAll')}
              </Link>
            </div>
          </Card>

          <Card className="border border-wf-border bg-white rounded-wf overflow-hidden shadow-sm">
            <CardHeader className="p-6 border-b border-slate-50">
               <div className="flex items-center gap-3">
                  <div className="size-10 bg-slate-50 rounded-wf flex items-center justify-center text-wf-near-black">
                    <ClockCircle className="size-6" />
                  </div>
                  <CardTitle className="text-lg font-black text-slate-800 tracking-tight uppercase">{t('timeline.title')}</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <div className="h-32 flex items-end gap-2">
                 {repairRequests.timeline.length > 0 ? (
                   repairRequests.timeline.map((point, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                       <div 
                         className="w-full bg-slate-100 group-hover:bg-primary transition-all duration-500 rounded-t-wf"
                         style={{ height: `${(point.count / Math.max(...repairRequests.timeline.map(p => p.count), 1)) * 100}%` }}
                       />
                       <span className="text-[8px] font-black text-slate-400 uppercase">{point.date.split('-').pop()}</span>
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-wf-near-black text-white px-2 py-1 rounded text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {t('timeline.requests', { count: point.count })}
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('timeline.noActivity')}</p>
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Offer Dynamics */}
        <Card className="border border-wf-border bg-white rounded-wf overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="p-6 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-amber-50 rounded-wf flex items-center justify-center text-amber-600">
                  <CardSend className="size-5" />
                </div>
                <CardTitle className="text-lg font-black text-slate-800 tracking-tight uppercase">{t('offers.title')}</CardTitle>
              </div>
              <div className="px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{t('offers.pending', { count: offers.pending })}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-wf border border-wf-border relative overflow-hidden">
              <div className={cn("absolute size-32 bg-primary/5 rounded-full blur-2xl", locale === 'ar' ? "left-[-20px] bottom-[-20px]" : "right-[-20px] bottom-[-20px]")} />
              <div className="space-y-1 relative z-10 text-start">
                <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('offers.acceptanceMatrix')}</p>
                <div className="text-4xl font-black text-wf-near-black tracking-tighter">{offers.acceptanceRate}%</div>
              </div>
              <div className="size-20 rounded-full border-8 border-slate-100 flex items-center justify-center relative z-10">
                <svg className="absolute inset-0 size-full -rotate-90">
                  <circle
                    cx="40" cy="40" r="32"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-primary transition-all duration-1000"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * offers.acceptanceRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <CheckCircle className="size-8 text-primary" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-wf-border rounded-wf hover:border-primary/30 transition-colors text-start">
                <p className="text-[9px] font-black text-wf-gray-300 uppercase mb-1 tracking-widest">{t('offers.strategicPipeline')}</p>
                <p className="text-2xl font-black text-wf-near-black">{offers.total} <span className="text-[10px] text-slate-400">{t('offers.sent')}</span></p>
              </div>
              <div className="p-4 bg-white border border-wf-border rounded-wf hover:border-primary/30 transition-colors text-start">
                <p className="text-[9px] font-black text-wf-gray-300 uppercase mb-1 tracking-widest">{t('offers.avgInspection')}</p>
                <p className="text-xl font-black text-wf-near-black">{format.number(offers.avgInspectionPrice, { style: 'currency', currency: 'EGP' })}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-emerald-600">{t('offers.accepted', { count: offers.accepted })}</span>
                <span className="text-red-500">{t('offers.rejected', { count: offers.rejected })}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(offers.accepted / Math.max(offers.total, 1)) * 100}%` }} />
                <div className="h-full bg-red-500 rounded-full transition-all duration-1000 ms-0.5" style={{ width: `${(offers.rejected / Math.max(offers.total, 1)) * 100}%` }} />
                <div className="h-full bg-amber-400 rounded-full transition-all duration-1000 ms-0.5" style={{ width: `${(offers.pending / Math.max(offers.total, 1)) * 100}%` }} />
              </div>
              <p className="text-[8px] text-center text-slate-400 font-black uppercase tracking-tighter">{t('offers.distributionMatrix')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Analysis */}
        <Card className="border border-wf-border bg-white rounded-wf overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="p-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-amber-50 rounded-wf flex items-center justify-center text-amber-600">
                <Star className="size-6" />
              </div>
              <CardTitle className="text-lg font-black text-slate-800 tracking-tight uppercase">{t('reviews.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <h4 className="text-5xl font-black text-wf-near-black leading-none">{overview.averageRating.toFixed(1)}</h4>
                <div className="flex items-center justify-center gap-0.5 mt-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className={cn("size-3", i <= Math.round(overview.averageRating) ? "fill-current" : "opacity-20")} />)}
                </div>
                <p className="text-[9px] font-black text-wf-gray-300 uppercase mt-2 tracking-widest">{t('reviews.count', { count: overview.totalReviews })}</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.distribution[star.toString()] || 0;
                  const percentage = (count / Math.max(overview.totalReviews, 1)) * 100;
                  return (
                    <div key={star} className="flex items-center gap-3 group">
                      <span className="text-[10px] font-black text-wf-gray-300 w-2">{star}</span>
                      <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full group-hover:bg-amber-500 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-wf-near-black w-4 text-start">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 text-start">
               <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest mb-4">{t('reviews.evolution')}</p>
               <div className="h-24 flex items-end gap-1.5">
                 {reviews.timeline.map((point, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                     <div 
                       className="w-full bg-amber-100 group-hover:bg-amber-400 transition-all duration-500 rounded-t-sm"
                       style={{ height: `${(point.avgRating / 5) * 100}%` }}
                     />
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-wf-near-black text-white px-2 py-1 rounded text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {point.avgRating.toFixed(1)} ★ ({point.count} rev)
                     </div>
                   </div>
                 ))}
               </div>
               <div className="mt-4 flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>{t('reviews.startPeriod')}</span>
                  <span>{t('reviews.latestUpdate')}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Logistics */}
        <div className="space-y-6 md:space-y-8">
          <Card className="border border-wf-border bg-white text-wf-near-black rounded-wf overflow-hidden relative group shadow-none hover:translate-x-1 hover:-translate-y-1 transition-all duration-500 text-start">
            <div className={cn("absolute size-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000", locale === 'ar' ? "-left-8 -bottom-8" : "-right-8 -bottom-8")} />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div className="size-14 bg-primary/5 rounded-wf-lg flex items-center justify-center border border-wf-border group-hover:rotate-12 transition-transform">
                  <CalendarMinimalistic className="size-8 text-primary" />
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                  subscription.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                )}>
                  {subscription.status ? subscription.status.toUpperCase() : t('subscription.noPlan')}
                </div>
              </div>
              <h3 className="text-2xl font-black mb-1 tracking-tight uppercase">{t('subscription.title')}</h3>
              <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-widest mb-6">
                {subscription.expiresAt ? t('subscription.validity', { date: format.dateTime(parseISO(subscription.expiresAt), { dateStyle: 'long' }) }) : t('subscription.missing')}
              </p>
              
              {subscription.daysRemaining !== null && (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                    <span className="opacity-60">{t('subscription.opsWindow')}</span>
                    <span className="text-primary">{t('subscription.cyclesRemaining', { count: subscription.daysRemaining })}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-wf-border">
                    <div 
                       className={cn(
                         "h-full rounded-full transition-all duration-1000",
                         subscription.daysRemaining > 30 ? "bg-primary" : "bg-red-500"
                       )} 
                       style={{ width: `${Math.min(100, (subscription.daysRemaining / 365) * 100)}%` }} 
                     />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-wf-border bg-white rounded-wf overflow-hidden flex flex-col flex-1 shadow-sm text-start">
            <CardHeader className="p-5 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-primary/10 rounded-wf flex items-center justify-center text-primary">
                   <Ticket className="size-5" />
                </div>
                <CardTitle className="text-sm font-black text-slate-800 tracking-tight uppercase">{t('support.title')}</CardTitle>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-100">
                 <span className="size-1.5 bg-red-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase text-red-500">{t('support.openReqs', { count: support.byStatus.OPEN || 0 })}</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-wf-lg border border-wf-border group hover:border-primary/30 transition-all text-start">
                   <p className="text-[9px] font-black text-wf-gray-300 uppercase mb-1 tracking-widest">{t('support.inProgress')}</p>
                   <p className="text-2xl font-black text-wf-near-black group-hover:text-primary transition-colors">{support.byStatus.IN_PROGRESS || 0}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-wf-lg border border-wf-border group hover:border-emerald-500/30 transition-all text-start">
                   <p className="text-[9px] font-black text-wf-gray-300 uppercase mb-1 tracking-widest">{t('support.resolved')}</p>
                   <p className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform origin-start">{support.byStatus.RESOLVED || 0}</p>
                 </div>
               </div>
               <div className="p-4 bg-red-50/30 border border-red-100/50 text-red-600 rounded-wf-lg flex items-center justify-between group overflow-hidden relative transition-colors hover:bg-red-50/50">
                  <div className={cn("absolute size-24 bg-red-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700", locale === 'ar' ? "left-[-20px] bottom-[-20px]" : "right-[-20px] bottom-[-20px]")} />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="size-8 bg-red-100 rounded-wf flex items-center justify-center">
                      <InfoCircle className="size-5 text-red-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{t('support.highPriority')}</span>
                  </div>
                  <span className={cn("text-xl font-black text-red-600 relative z-10", locale === 'ar' && "mr-auto ml-0")}>{support.byPriority.HIGH || 0}</span>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logistics & Navigation Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-start">         <Link href="/dashboard/brand-chat" className="p-6 bg-white border border-wf-border rounded-wf flex items-center gap-5 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="size-14 bg-primary/5 rounded-wf-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <ChatLine className="size-7" />
          </div>
          <div className="text-start">
            <p className="text-[12px] font-black text-wf-near-black uppercase tracking-widest mb-1">{t('nodes.reviaAssistant')}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('nodes.messagingNode')}</p>
          </div>
        </Link>
        <Link href="/dashboard/payouts" className="p-6 bg-white border border-wf-border rounded-wf flex items-center gap-5 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="size-14 bg-emerald-50 rounded-wf-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
            <HandMoney className="size-7" />
          </div>
          <div className="text-start">
            <p className="text-[12px] font-black text-wf-near-black uppercase tracking-widest mb-1">{t('nodes.assetLedger')}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('nodes.capitalDisbursement')}</p>
          </div>
        </Link>
        <Link href="/dashboard/repair-requests" className="p-6 bg-white border border-wf-border rounded-wf flex items-center gap-5 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="size-14 bg-purple-50 rounded-wf-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
            <Tuning className="size-7" />
          </div>
          <div className="text-start">
            <p className="text-[12px] font-black text-wf-near-black uppercase tracking-widest mb-1">{t('nodes.operations')}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('nodes.serviceRegistry')}</p>
          </div>
        </Link>
        <Link href="/dashboard/brand" className="p-6 bg-white border border-wf-border rounded-wf flex items-center gap-5 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className={cn("absolute size-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700", locale === 'ar' ? "-left-6 -bottom-6" : "-right-6 -bottom-6")} />
          <div className="size-14 bg-slate-50 text-wf-near-black rounded-wf-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
            <Star className="size-7" />
          </div>
          <div className="text-start relative z-10">
            <p className="text-[12px] font-black text-wf-near-black uppercase tracking-widest mb-1">{t('nodes.brandIdentity')}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('nodes.profileReputation')}</p>
          </div>
        </Link>
      </div>
      
      {/* System Preferences Quick Link */}
      <div className="flex justify-center pt-4">
         <Link href="/dashboard/settings" className="flex items-center gap-2 px-6 py-3 rounded-full border border-wf-border bg-slate-50/50 hover:bg-white hover:border-primary transition-all text-wf-gray-300 hover:text-wf-near-black group">
            <Settings className="size-4 group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('systemConfig')}</span>
         </Link>
      </div>
    </div>
  );
}
