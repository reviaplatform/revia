"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  ArrowLeft,
  Calendar,
  MapPoint,
  AddCircle,
  InfoCircle,
  History,
  Gallery,
  Notes,
  User,
  Routing,
  TrashBinMinimalistic
} from '@solar-icons/react';
import { Portal } from '@/components/ui/Portal';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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

const statusLabels: Record<string, string> = {
  ai_assessing: 'ASSESSMENT',
  pending_brand_selection: 'SELECTION',
  pending_offers: 'OFFERING',
  offer_selected: 'OFFER_ACCEPTED',
  inspection_pending: 'DIAGNOSIS',
  inspection_done: 'DIAGNOSED',
  payment_pending: 'PAYMENT_PENDING',
  payment_done: 'PAID',
  pending_provider_repair: 'IN_REPAIR',
  pending_user_device_pickup: 'READY FOR PICKUP',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

type ModalType = 'offer' | 'inspection' | 'pay' | null;
type PayTarget = 'inspection' | 'final';

export default function RepairRequestDetailsPage() {
  const t = useTranslations('RepairDetails');
  const locale = useLocale();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { brand } = useAuth();

  const [req, setReq] = useState<RepairRequest | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [payTarget, setPayTarget] = useState<PayTarget>('inspection');

  // Offer form
  const [branchIndex, setBranchIndex] = useState('0');
  const [inspectionPrice, setInspectionPrice] = useState('0');
  const [offerItems, setOfferItems] = useState([
    { expectedIssue: '', minPrice: '', maxPrice: '', expectedFinishDate: '' }
  ]);

  // Set default branch if available
  useEffect(() => {
    if (brand?.branches && brand.branches.length > 0) {
      const firstActiveIndex = brand.branches.findIndex((b: any) => b.isActive);
      setBranchIndex(String(firstActiveIndex >= 0 ? firstActiveIndex : 0));
    }
  }, [brand]);

  // Inspection result form
  const [resultNotes, setResultNotes] = useState('');
  const [finalPrice, setFinalPrice] = useState('');

  // Pay form
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');

  const fetchRequest = async () => {
    setIsFetching(true);
    try {
      const res = await apiClient.get(`/repair-requests/${id}`);
      setReq(res.data.data);
    } catch (error) {
      console.error('Failed to fetch repair request', error);
      toast.error(t('messages.loadError'));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  const closeModal = () => {
    setModalType(null);
    setOfferItems([{ expectedIssue: '', minPrice: '', maxPrice: '', expectedFinishDate: '' }]);
    setInspectionPrice('0');
    setResultNotes(''); setFinalPrice('');
    setPayMethod('cash');
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasInvalidRange = offerItems.some(
      item => item.minPrice !== '' && item.maxPrice !== '' && Number(item.maxPrice) < Number(item.minPrice)
    );
    if (hasInvalidRange) {
      toast.error(t('modals.sendOffer.priceRangeError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SendOfferRequest = {
        branchIndex: Number(branchIndex),
        distanceKm: 1, // Default 1km as requested
        inspectionPrice: Number(inspectionPrice),
        offerItems: offerItems.map(item => {
          if (!item.expectedFinishDate) {
            throw new Error('Please select an expected finish date for all items');
          }
          return {
            expectedIssue: item.expectedIssue,
            priceRange: { min: Number(item.minPrice), max: Number(item.maxPrice) },
            expectedFinishDate: new Date(item.expectedFinishDate).toISOString(),
          };
        }),
      };
      await apiClient.post(`/repair-requests/${id}/offer`, payload);
      toast.success(t('messages.offerSuccess'));
      closeModal();
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || t('messages.offerError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectionResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: InspectionResultRequest = {
        resultNotes,
        finalPrice: Number(finalPrice),
        images: [],
      };
      await apiClient.post(`/repair-requests/${id}/inspection`, payload);
      toast.success(t('messages.diagnosisSuccess'));
      closeModal();
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.diagnosisError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = payTarget === 'inspection'
        ? `/repair-requests/${id}/pay-inspection`
        : `/repair-requests/${id}/pay-final`;
      await apiClient.post(endpoint, { paymentMethod: payMethod });
      toast.success(t('messages.paymentSuccess'));
      closeModal();
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.paymentError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpleAction = async (action: 'finish' | 'user-get-device') => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/repair-requests/${id}/${action}`);
      toast.success(action === 'finish' ? t('messages.finishSuccess') : t('messages.pickupSuccess'));
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.actionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto border-t-2 border-wf-border">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-wf-border">
          <div className="space-y-4">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-wf" />
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-12 w-40 rounded-wf" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <Skeleton className="h-3 w-40" />
              <div className="border border-wf-border rounded-wf overflow-hidden bg-white">
                <Skeleton className="h-24 w-full" />
                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-wf-border/30">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-2 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row border-t border-wf-border/30">
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-wf" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-wf" />
                  </div>
                  <div className="w-full md:w-80 p-8 bg-slate-50 space-y-6 border-l border-wf-border/30">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 space-y-8 bg-slate-100 border-none shadow-none">
              <div className="flex items-center gap-3 pb-6 border-b border-wf-border/30">
                <Skeleton className="size-8 rounded-wf bg-white" />
                <Skeleton className="h-4 w-24 bg-white" />
              </div>
              <Skeleton className="h-14 w-full rounded-wf bg-white" />
            </Card>
            <Card className="p-8 space-y-6 border border-wf-border rounded-wf shadow-none">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <CloseCircle className="size-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">{t('messages.loadError')}</h2>
          <Button className="mt-6" onClick={() => router.push('/dashboard/repair-requests')}>
            {t('back')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto border-t-2 border-[oklch(0.60_0.18_40)]">
      {/* Header Registry Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-wf-border">
        <div className="space-y-4">
          <Link 
            href="/dashboard/repair-requests" 
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-wf-gray-300 hover:text-[oklch(0.60_0.18_40)] transition-all"
          >
            <ArrowLeft className={cn("size-3 transition-transform", locale === 'ar' ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1")} />
            {t('back')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[oklch(0.60_0.18_40)]/10 text-[oklch(0.60_0.18_40)] rounded-wf flex items-center justify-center">
              <Settings className="size-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
              {t('title')} <span className="text-wf-gray-300 ms-2">#{id.slice(-8).toUpperCase()}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
              {t('unitId')}: {id}
            </p>
            <div className="size-1 bg-[oklch(0.92_0.005_262)] rounded-full" />
            <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
              {t('logged')}: {new Date(req.createdAt).toLocaleDateString(locale)}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "shrink-0 px-5 py-3 rounded-wf text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border transition-all duration-500 shadow-sm",
          statusColors[req.status] || 'bg-slate-50 text-wf-gray-300 border-wf-border'
        )}>
          <div className={cn("size-2.5 rounded-full bg-current", req.status !== 'completed' && req.status !== 'cancelled' && "animate-pulse")} />
          {t(`statusLabels.${req.status}`) || req.status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Primary Data Column - High Rhythm Flow */}
        <div className={cn("lg:col-span-8 space-y-12", locale === 'ar' ? "lg:order-2" : "lg:order-1")}>
          
          {/* Intake Module - Semi-Open Layout */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="size-1.5 rounded-full bg-primary" />
              <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.3em]">{t('phase1')}</p>
            </div>
            
            <div className="overflow-hidden border border-wf-border bg-white rounded-wf shadow-sm divide-y divide-wf-border/30">
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-primary" />
              
              {/* Device Profile Header - Integrated */}
              <div className="p-8 bg-[oklch(0.99_0.01_262)] flex items-center justify-between group">
                <div className="space-y-1 text-start">
                  <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em]">{t('hardwareProfile')}</p>
                  <h2 className="text-2xl font-black text-wf-near-black tracking-tighter uppercase">
                    {req.device?.manufacturer || t('generic')} {req.device?.deviceModel || t('terminal')}
                  </h2>
                </div>
                <Smartphone className="size-8 text-primary opacity-10 group-hover:opacity-30 transition-opacity duration-700" />
              </div>

              {/* Technical Specs Array */}
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-2 text-start">
                  <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{t('manufacturer')}</p>
                  <p className="text-xs font-black text-wf-near-black uppercase">{req.device?.manufacturer || 'N/A'}</p>
                </div>
                <div className="space-y-2 text-start">
                  <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{t('modelSpec')}</p>
                  <p className="text-xs font-black text-wf-near-black uppercase">{req.device?.deviceModel || 'N/A'}</p>
                </div>
                <div className="space-y-2 text-start">
                  <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{t('osEnvironment')}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary text-white rounded-[2px] text-[8px] font-black uppercase tracking-tighter italic">
                      {req.device?.platform || 'CORE'}
                    </span>
                    <p className="text-xs font-black text-wf-near-black tracking-tight">{req.device?.osVersion || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-end">
                  <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{t('requestedOn')}</p>
                  <p className="text-xs font-black text-wf-near-black font-mono">{new Date(req.createdAt).toLocaleDateString(locale)}</p>
                </div>
              </div>

              {/* Statement & AI Logic - Fused Bottom */}
              <div className={cn("flex flex-col md:flex-row divide-wf-border/30", locale === 'ar' ? "divide-x-reverse md:divide-x" : "md:divide-x")}>
                <div className="flex-1 p-8 space-y-6 bg-[oklch(0.99_0.02_40)] flex flex-col relative overflow-hidden">
                  {/* Local Accent Indicator */}
                  <div className="absolute top-0 start-0 w-full h-1 bg-[oklch(0.60_0.18_40)]" />
                  
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-[oklch(0.60_0.18_40)] text-white rounded-wf flex items-center justify-center shadow-lg shadow-[oklch(0.60_0.18_40)]/20">
                      <Notes className="size-4" />
                    </div>
                    <h3 className="font-black text-wf-near-black text-sm uppercase tracking-widest">{t('issueDescription')}</h3>
                  </div>
                  <div className="p-6 bg-white border border-[oklch(0.60_0.18_40)]/10 rounded-wf relative overflow-hidden min-h-[100px] flex items-center">
                    <div className={cn("absolute top-0 p-3 text-[oklch(0.60_0.18_40)] opacity-[0.03]", locale === 'ar' ? "left-0" : "right-0")}>
                      <History className="size-24" />
                    </div>
                    <p className="text-xs text-wf-near-black font-black uppercase tracking-wider leading-relaxed relative z-10 text-start">
                      {req.issueText || t('noDescription')}
                    </p>
                  </div>
                </div>

                {req.aiReport && req.aiReport.length > 0 && (
                  <div className="w-full md:w-80 bg-purple-50 p-8 space-y-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 start-0 w-full h-1 bg-purple-400" />
                    <div className="flex items-center gap-3 text-purple-700 border-b border-purple-100/50 pb-4">
                      <div className="size-8 bg-purple-100 rounded-wf flex items-center justify-center">
                        <InfoCircle className="size-5" />
                      </div>
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">{t('aiInsight')}</h3>
                    </div>
                    <div className="space-y-4">
                      {req.aiReport.map((point, idx) => (
                        <div key={idx} className="flex gap-4 items-start group/ai">
                          <div className="size-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0 shadow-sm" />
                          <p className="text-[10px] text-purple-900 font-bold uppercase tracking-wide leading-snug text-start">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Provider Performance / Offer Section */}
          {(req.offer || req.isSendOffer) && (
            <Card className="p-8 border border-primary/10 bg-white rounded-wf shadow-sm space-y-8 relative overflow-hidden group transition-all duration-500 hover:shadow-md">
              <div className="absolute top-0 start-0 w-full h-1.5 bg-primary" />
              <div className="flex items-center justify-between border-b border-wf-border/30 pb-6">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-primary/10 text-primary rounded-wf flex items-center justify-center shadow-sm">
                    <Routing className="size-4" />
                  </div>
                  <h3 className="font-black text-wf-near-black text-sm uppercase tracking-widest flex items-center gap-2">
                    <span>{t('repairOffer')}</span>
                  </h3>
                </div>
                {req.selectedOfferId && req.offer && req.selectedOfferId === req.offer.id && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-wf border border-emerald-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
                    <CheckCircle className="size-3" />
                    {t('offerAccepted')}
                  </div>
                )}
              </div>

              {req.offer ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-primary/[0.03] border border-primary/10 rounded-wf transition-colors group-hover:bg-primary/[0.05]">
                    <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{t('inspectionFee')}</span>
                    <span className="text-sm font-black text-primary font-mono">{req.offer.inspectionPrice} EGP</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {req.offer.offerItems?.map((item, idx) => (
                      <div key={idx} className="p-5 bg-white border border-wf-border rounded-wf group/item hover:border-primary transition-all space-y-4 shadow-sm hover:shadow-md">
                        <div className="space-y-1 text-start">
                          <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest group-hover/item:text-primary/50 transition-colors">{t('description')}</p>
                          <p className="text-xs font-black text-wf-near-black uppercase tracking-tight">{item.expectedIssue}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-wf-border/50">
                          <div className="space-y-0.5 text-start">
                            <p className="text-[8px] font-black text-wf-gray-300 uppercase tracking-widest">{t('quoteRange')}</p>
                            <p className="text-xs font-black text-primary font-mono">
                              {item.priceRange.min === item.priceRange.max
                                ? `${item.priceRange.min}`
                                : `${item.priceRange.min} - ${item.priceRange.max}`} EGP
                            </p>
                          </div>
                          <div className="text-end space-y-0.5">
                            <p className="text-[8px] font-black text-wf-gray-300 uppercase tracking-widest">{t('estimatedCompletion')}</p>
                            <p className="text-xs font-black text-wf-near-black flex items-center gap-1 justify-end">
                              <Calendar className="size-3 text-primary/40" />
                              {new Date(item.expectedFinishDate).toLocaleDateString(locale)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border-dashed border-2 border-primary/5 bg-primary/[0.01] rounded-wf">
                  <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.2em] italic">{t('offerSent')}</p>
                </div>
              )}
            </Card>
          )}

          {/* Final Diagnostics Unit */}
          {req.inspection && (
            <Card className="p-8 border border-success/20 bg-success-bg/30 rounded-wf shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden group transition-all hover:shadow-md">
              <div className="absolute top-0 start-0 w-full h-1.5 bg-success" />
              <div className="flex items-center justify-between border-b border-success/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-success text-white rounded-wf flex items-center justify-center shadow-lg shadow-success/20 group-hover:rotate-6 transition-transform">
                    <CheckCircle className="size-5" />
                  </div>
                  <h3 className="font-black text-wf-near-black text-sm uppercase tracking-widest">{t('technicalDiagnosis')}</h3>
                </div>
                <div className="text-end">
                  <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('finalPrice')}</p>
                  <p className="text-2xl font-black text-success tracking-tighter font-mono">{req.inspection.finalPrice} EGP</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white border border-success/10 rounded-wf space-y-3 shadow-inner text-start">
                  <p className="text-[10px] font-black text-success uppercase tracking-[0.2em]">{t('findingsReport')}</p>
                  <p className="text-xs text-wf-near-black font-black uppercase tracking-wider leading-relaxed">
                    {req.inspection.resultNotes}
                  </p>
                </div>

                {req.inspection.images && req.inspection.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-wf-gray-300">
                      <Gallery className="size-3 text-success/40" />
                      <p className="text-[9px] font-black uppercase tracking-widest">{t('technicalImages')}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {req.inspection.images.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-wf overflow-hidden border border-success/10 bg-white group cursor-pointer shadow-sm hover:border-success/40 transition-all">
                          <img 
                            src={img} 
                            alt={`Registry ${idx}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-success/10">
                  <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest flex items-center gap-2">
                    <User className="size-3 text-success/40" /> {t('loggedBy')}
                  </p>
                  <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest font-mono">
                    {new Date(req.inspection.createdAt).toLocaleString(locale)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Administrative Controls Column - Sticky Strategy */}
        <div className={cn("lg:col-span-4 lg:sticky lg:top-8 self-start space-y-8", locale === 'ar' ? "lg:order-1" : "lg:order-2")}>
          
          {/* Action Dashboard */}
          <Card className="p-8 border border-wf-border bg-white text-wf-near-black rounded-wf shadow-none space-y-8">
            <div className="flex items-center gap-3 border-b border-wf-border pb-6 text-wf-near-black">
              <div className="size-8 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
                <Settings className="size-4" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest">{t('actionsTitle')}</h3>
            </div>
            
            <div className="space-y-4">
              {req.status === 'pending_offers' && !req.isSendOffer && (
                <Button 
                  onClick={() => setModalType('offer')} 
                  className="w-full h-14 rounded-wf bg-primary text-white hover:bg-primary-vibrant font-black text-[11px] uppercase tracking-widest transition-all" 
                  disabled={isSubmitting}
                >
                  {t('sendOffer')}
                </Button>
              )}
              {req.status === 'pending_offers' && req.isSendOffer && (
                <div className="p-5 bg-slate-50 border border-wf-border rounded-wf text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-wf-gray-300">{t('awaitingResponse')}</p>
                </div>
              )}
              {req.status === 'offer_selected' && req.selectedOfferId === req.offer?.id && (
                <Button 
                  onClick={() => { setPayTarget('inspection'); setModalType('pay'); }} 
                  className="w-full h-14 rounded-wf bg-primary text-white hover:bg-primary-vibrant font-black text-[11px] uppercase tracking-widest transition-all" 
                  disabled={isSubmitting}
                >
                  {t('receiveInspection')}
                </Button>
              )}
              {req.status === 'inspection_pending' && req.selectedOfferId === req.offer?.id && (
                <Button 
                  onClick={() => setModalType('inspection')} 
                  className="w-full h-14 rounded-wf bg-primary text-white hover:bg-primary-vibrant font-black text-[11px] uppercase tracking-widest transition-all" 
                  disabled={isSubmitting}
                >
                  {t('submitDiagnosis')}
                </Button>
              )}
              {req.status === 'payment_pending' && req.selectedOfferId === req.offer?.id && (
                <Button 
                  onClick={() => { setPayTarget('final'); setModalType('pay'); }} 
                  className="w-full h-14 rounded-wf bg-primary text-white hover:bg-primary-vibrant font-black text-[11px] uppercase tracking-widest transition-all" 
                  disabled={isSubmitting}
                >
                  {t('receiveFinal')}
                </Button>
              )}
              {req.status === 'pending_provider_repair' && req.selectedOfferId === req.offer?.id && (
                <Button 
                  onClick={() => handleSimpleAction('finish')} 
                  className="w-full h-14 rounded-wf bg-success text-white hover:bg-success/90 font-black text-[11px] uppercase tracking-widest transition-all" 
                  isLoading={isSubmitting}
                >
                  {t('markFinished')}
                </Button>
              )}
              {req.status === 'pending_user_device_pickup' && req.selectedOfferId === req.offer?.id && (
                <Button 
                  onClick={() => handleSimpleAction('user-get-device')} 
                  className="w-full h-14 rounded-wf bg-primary text-white hover:bg-primary-vibrant font-black text-[11px] uppercase tracking-widest transition-all" 
                  isLoading={isSubmitting}
                >
                  {t('markCollected')}
                </Button>
              )}

              {req.selectedOfferId && req.offer && req.selectedOfferId !== req.offer.id && (
                <div className="p-6 bg-red-50/50 border border-red-100 rounded-wf text-center space-y-2">
                  <p className="font-black text-[11px] uppercase tracking-widest text-red-600">{t('alreadyHandled')}</p>
                  <p className="text-[9px] font-bold text-red-600/60 uppercase tracking-widest leading-loose">{t('handledDesc')}</p>
                </div>
              )}

              {req.status === 'completed' && req.selectedOfferId === req.offer?.id && (
                <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-wf text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t('repairCompleted')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Registry */}
          {(req.inspectionPayment || req.finalPayment) && (
            <Card className="p-8 border border-emerald-100 bg-[oklch(0.98_0.02_150)] rounded-wf shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
              <div className="absolute top-0 start-0 w-full h-1.5 bg-emerald-400" />
              <div className="flex items-center gap-3 border-b border-emerald-100/50 pb-6 text-emerald-900/60">
                <div className="size-8 bg-emerald-100 text-emerald-600 rounded-wf flex items-center justify-center shadow-sm">
                  <Dollar className="size-4" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-widest">{t('paymentHistory')}</h3>
              </div>

              <div className="space-y-6">
                {req.inspectionPayment && (
                  <div className="flex items-center gap-4 group">
                    <div className={cn(
                      "size-10 rounded-wf flex items-center justify-center transition-all border",
                      req.inspectionPayment.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" : "bg-slate-50 text-wf-gray-300 border-wf-border/30"
                    )}>
                      <Dollar className="size-5" />
                    </div>
                    <div className="flex-1 text-start">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-black text-emerald-900/60 uppercase tracking-widest">{t('inspectionFee')}</p>
                        <span className={cn(
                          "text-[8px] uppercase font-black px-2 py-0.5 rounded-[2px] transition-colors border",
                          req.inspectionPayment.status === 'paid' ? "bg-emerald-500 text-white border-emerald-400" : "bg-slate-100 text-wf-gray-300 border-wf-border/50"
                        )}>{req.inspectionPayment.status}</span>
                      </div>
                      <p className="text-[11px] font-black text-emerald-700/40 font-mono italic">
                        {req.inspectionPayment.amount} EGP via {req.inspectionPayment.method.toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}
                {req.finalPayment && (
                  <div className="flex items-center gap-4 pt-6 border-t border-emerald-100/50 group">
                    <div className={cn(
                      "size-10 rounded-wf flex items-center justify-center transition-all border",
                      req.finalPayment.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" : "bg-slate-50 text-wf-gray-300 border-wf-border/30"
                    )}>
                      <Dollar className="size-5" />
                    </div>
                    <div className="flex-1 text-start">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-black text-emerald-900/60 uppercase tracking-widest">{t('finalPrice')}</p>
                        <span className={cn(
                          "text-[8px] uppercase font-black px-2 py-0.5 rounded-[2px] transition-colors border",
                          req.finalPayment.status === 'paid' ? "bg-emerald-500 text-white border-emerald-400" : "bg-slate-100 text-wf-gray-300 border-wf-border/50"
                        )}>{req.finalPayment.status}</span>
                      </div>
                      <p className="text-[11px] font-black text-emerald-700/40 font-mono italic">
                        {req.finalPayment.amount} EGP via {req.finalPayment.method.toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Event Log - Integrated Sidebar Feed */}
          {req.statusLogs && req.statusLogs.length > 0 && (
            <div className="space-y-8 ps-1">
               <div className="flex items-center gap-3 border-b border-wf-border/30 pb-6">
                <div className="size-8 bg-primary/10 rounded-wf flex items-center justify-center border border-primary/20">
                  <History className="size-4 text-primary" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-widest text-wf-near-black">{t('jobTimeline')}</h3>
              </div>

              <div className={cn("space-y-6 relative before:absolute before:inset-0 before:h-full before:w-[1px] before:bg-slate-100", locale === 'ar' ? "before:mr-[15px]" : "before:ml-[15px]")}>
                {[...req.statusLogs].reverse().map((log, index) => (
                  <div key={index} className="relative flex items-start gap-4 group">
                    <div className="size-8 rounded-wf border-2 border-white bg-primary group-hover:bg-primary-vibrant text-white flex items-center justify-center z-10 shrink-0 shadow-md transition-colors">
                      <div className="size-1 rounded-full bg-white transition-all group-hover:scale-150" />
                    </div>
                    <div className="flex-1 bg-white border border-wf-border/50 rounded-wf p-4 space-y-1 transition-all group-hover:bg-primary/[0.02] group-hover:border-primary/30 group-hover:shadow-sm text-start">
                      <p className="text-[10px] font-black text-wf-near-black uppercase tracking-widest transition-colors group-hover:text-primary">
                        {t(`statusLabels.${log.status}`) || log.status}
                      </p>
                      <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest font-mono">
                         {new Date(log.timestamp).toLocaleString(locale)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalType === 'offer' && (
        <Portal>
          <div className="modal-overlay !items-end sm:!items-center !p-0 sm:!p-4" onClick={closeModal} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Card
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg shadow-none border border-wf-border bg-white rounded-t-wf sm:rounded-wf animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 ease-[var(--ease-out-expo)] flex flex-col h-[92vh] sm:h-auto max-h-[92vh] sm:max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 sm:p-8 pb-6 border-b border-primary/10 shrink-0">
                <div className="flex flex-col gap-1 text-start">
                  <h2 className="text-lg sm:text-xl font-black text-wf-near-black uppercase tracking-tighter">{t('modals.sendOffer.title')}</h2>
                  <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">{t('modals.sendOffer.subtitle')}</p>
                </div>
                <button onClick={closeModal} className="size-8 rounded-wf border border-wf-border flex items-center justify-center text-wf-gray-300 hover:text-primary transition-all shrink-0">
                  <CloseCircle className="size-5" />
                </button>
              </div>
              <form onSubmit={handleSendOffer} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6" data-lenis-prevent>
                  <div className="space-y-2 text-start">
                    <label className="text-[10px] font-black text-wf-near-black uppercase tracking-widest">{t('modals.sendOffer.feeLabel')}</label>
                    <Input
                      type="number"
                      placeholder="e.g. 150"
                      value={inspectionPrice}
                      onChange={e => setInspectionPrice(e.target.value)}
                      className="h-12 border-wf-border rounded-wf font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-wf-near-black uppercase tracking-widest">{t('modals.sendOffer.itemsLabel')}</label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOfferItems([...offerItems, { expectedIssue: '', minPrice: '', maxPrice: '', expectedFinishDate: '' }])}
                        className="text-primary hover:bg-primary/5 font-black text-[9px] uppercase tracking-widest h-8 px-3 rounded-wf"
                      >
                        <AddCircle className={cn("size-3", locale === 'ar' ? "ml-2" : "mr-2")} />
                        {t('modals.sendOffer.addItem')}
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {offerItems.map((item, index) => {
                        const isInvalidRange = item.minPrice !== '' && item.maxPrice !== '' && Number(item.maxPrice) < Number(item.minPrice);
                        return (
                        <div key={index} className="p-4 sm:p-6 bg-slate-50 border border-wf-border rounded-wf space-y-6 relative group/item">
                          {offerItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setOfferItems(offerItems.filter((_, i) => i !== index))}
                              className={cn("absolute top-4 p-2 bg-white text-wf-gray-300 hover:text-red-500 rounded-wf border border-wf-border transition-all shadow-sm", locale === 'ar' ? "left-4" : "right-4")}
                            >
                              <TrashBinMinimalistic className="size-3" />
                            </button>
                          )}
                          <div className="space-y-2 text-start">
                            <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modals.sendOffer.itemDesc')}</label>
                            <Input
                              placeholder="e.g. Display Assembly Replacement"
                              value={item.expectedIssue}
                              onChange={e => {
                                const newItems = [...offerItems];
                                newItems[index].expectedIssue = e.target.value;
                                setOfferItems(newItems);
                              }}
                              className="h-11 border-wf-border rounded-wf text-xs uppercase font-black tracking-tight"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2 text-start">
                              <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modals.sendOffer.minPrice')}</label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="Min"
                                value={item.minPrice}
                                onChange={e => {
                                  const newItems = [...offerItems];
                                  newItems[index].minPrice = e.target.value;
                                  setOfferItems(newItems);
                                }}
                                className="h-11 border-wf-border rounded-wf font-mono text-xs"
                                required
                              />
                            </div>
                            <div className="space-y-2 text-start">
                              <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modals.sendOffer.maxPrice')}</label>
                              <Input
                                type="number"
                                min={item.minPrice || 0}
                                placeholder="Max"
                                value={item.maxPrice}
                                onChange={e => {
                                  const newItems = [...offerItems];
                                  newItems[index].maxPrice = e.target.value;
                                  setOfferItems(newItems);
                                }}
                                className={cn("h-11 rounded-wf font-mono text-xs", isInvalidRange ? "border-red-400 focus-visible:ring-red-400/20" : "border-wf-border")}
                                required
                              />
                            </div>
                          </div>
                          {isInvalidRange && (
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest -mt-2">{t('modals.sendOffer.priceRangeError')}</p>
                          )}
                          <div className="space-y-2 text-start">
                            <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('modals.sendOffer.finishDate')}</label>
                            <Input
                              type="datetime-local"
                              value={item.expectedFinishDate}
                              onChange={e => {
                                const newItems = [...offerItems];
                                newItems[index].expectedFinishDate = e.target.value;
                                setOfferItems(newItems);
                              }}
                              className="h-11 border-wf-border rounded-wf text-xs uppercase font-black"
                              required
                            />
                          </div>
                        </div>
                      );})}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-6 sm:p-8 pt-6 border-t border-wf-border shrink-0">
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-wf font-black uppercase tracking-widest text-[10px] border-wf-border hover:bg-slate-50 transition-all" onClick={closeModal} disabled={isSubmitting}>{t('actions.cancel')}</Button>
                  <Button type="submit" className="flex-1 h-12 rounded-wf font-black uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary-vibrant transition-all shadow-md shadow-primary/10" isLoading={isSubmitting}>{t('modals.sendOffer.submit')}</Button>
                </div>
              </form>
            </Card>
          </div>
        </Portal>
      )}

      {modalType === 'inspection' && (
        <Portal>
          <div className="modal-overlay" onClick={closeModal} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-lg p-8 shadow-none border border-wf-border bg-white rounded-wf animate-in zoom-in-95 duration-300 ease-[var(--ease-out-expo)]" data-lenis-prevent>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-wf-border">
                <div className="flex flex-col gap-1 text-start">
                  <h2 className="text-xl font-black text-wf-near-black uppercase tracking-tighter">{t('modals.diagnosis.title')}</h2>
                  <p className="text-[10px] text-wf-gray-300 font-black uppercase tracking-widest">{t('modals.diagnosis.subtitle')}</p>
                </div>
                <button onClick={closeModal} className="size-8 rounded-wf border border-wf-border flex items-center justify-center text-wf-gray-300 hover:text-primary transition-all">
                  <CloseCircle className="size-5" />
                </button>
              </div>
              <form onSubmit={handleInspectionResult} className="space-y-6">
                <div className="space-y-2 text-start">
                  <label className="text-[10px] font-black text-wf-near-black uppercase tracking-widest">{t('modals.diagnosis.notes')}</label>
                  <textarea
                    className="w-full min-h-[120px] p-4 text-xs font-black uppercase tracking-wide rounded-wf border border-wf-border bg-slate-50 outline-none focus:border-primary transition-all leading-relaxed text-start"
                    placeholder="..."
                    value={resultNotes}
                    onChange={e => setResultNotes(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 text-start">
                  <label className="text-[10px] font-black text-wf-near-black uppercase tracking-widest">{t('modals.diagnosis.finalPrice')}</label>
                  <Input 
                    type="number" 
                    placeholder="Total Repair Cost" 
                    value={finalPrice} 
                    onChange={e => setFinalPrice(e.target.value)} 
                    className="h-12 border-wf-border rounded-wf font-mono text-sm"
                    required 
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-wf font-black uppercase tracking-widest text-[10px]" onClick={closeModal} disabled={isSubmitting}>{t('actions.cancel')}</Button>
                  <Button type="submit" className="flex-1 h-12 rounded-wf font-black uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary-vibrant transition-all shadow-md shadow-primary/10" isLoading={isSubmitting}>{t('modals.diagnosis.submit')}</Button>
                </div>
              </form>
            </Card>
          </div>
        </Portal>
      )}

      {modalType === 'pay' && (
        <Portal>
          <div className="modal-overlay" onClick={closeModal} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-sm p-8 shadow-none border border-wf-border bg-white rounded-wf animate-in zoom-in-95 duration-300 ease-[var(--ease-out-expo)]" data-lenis-prevent>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-wf-border">
                <div className="flex flex-col gap-1 text-start">
                  <h2 className="text-lg font-black text-wf-near-black uppercase tracking-tighter">
                    {payTarget === 'inspection' ? t('receiveInspection') : t('receiveFinal')}
                  </h2>
                </div>
                <button onClick={closeModal} className="size-6 text-wf-gray-300 hover:text-primary transition-all">
                  <CloseCircle className="size-5" />
                </button>
              </div>
              
              <div className="mb-6 p-6 bg-slate-50 border border-wf-border rounded-wf text-center">
                <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest mb-1">{t('modals.payment.amountToCollect')}</p>
                <p className="text-3xl font-black text-wf-near-black font-mono">
                  {payTarget === 'inspection' ? req.offer?.inspectionPrice : req.inspection?.finalPrice} EGP
                </p>
              </div>

              <form onSubmit={handlePay} className="space-y-6">
                <div className="space-y-3 text-start">
                  <label className="text-[10px] font-black text-wf-near-black uppercase tracking-widest">{t('modals.payment.method')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPayMethod('cash')}
                      className={cn(
                        "p-5 border rounded-wf flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center",
                        payMethod === 'cash'
                          ? "border-primary bg-primary/[0.04] text-primary"
                          : "border-wf-border hover:border-wf-border-hover text-wf-gray-300 hover:text-wf-near-black"
                      )}
                    >
                      <Dollar className="size-6" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('modals.payment.cash')}</span>
                    </button>
                    {brand?.allowPayUsePOS && (
                      <button
                        type="button"
                        onClick={() => setPayMethod('pos')}
                        className={cn(
                          "p-5 border rounded-wf flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center",
                          payMethod === 'pos'
                            ? "border-primary bg-primary/[0.04] text-primary"
                            : "border-wf-border hover:border-wf-border-hover text-wf-gray-300 hover:text-wf-near-black"
                        )}
                      >
                        <Smartphone className="size-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('modals.payment.pos')}</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-wf font-black uppercase tracking-widest text-[10px]" onClick={closeModal} disabled={isSubmitting}>{t('actions.cancel')}</Button>
                  <Button type="submit" className="flex-1 h-12 rounded-wf font-black uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary-vibrant transition-all shadow-md shadow-primary/10" isLoading={isSubmitting}>{t('modals.payment.submit')}</Button>
                </div>
              </form>
            </Card>
          </div>
        </Portal>
      )}
    </div>
  );
}
