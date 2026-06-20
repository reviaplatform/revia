"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, notFound, useSearchParams } from 'next/navigation';
import { getRepair, cancelRepair, getInspectionResults } from '@/lib/api/repairs';
import { getOffers } from '@/lib/api/offers';
import { RepairRequest, RepairRequestStatus, RepairRequestFlow, Offer } from '@/lib/api/types';
import { Smartphone, Calendar, InfoCircle, CloseCircle, ChatUnread, Stars, CheckCircle, AltArrowRight, AltArrowLeft, BillList, Star } from '@solar-icons/react';
import ChatPopup from '@/components/dashboard/repairs/ChatPopup';
import OfferSection from '@/components/dashboard/repairs/OfferSection';
import PaymentBlock from '@/components/dashboard/repairs/PaymentBlock';
import ReviewForm from '@/components/dashboard/repairs/ReviewForm';
import ConfirmModal from '@/components/ui/confirm-modal';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

function RepairDetailsContent({ lang, id }: { lang: 'en' | 'ar', id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAr = lang === 'ar';
  
  const [repair, setRepair] = useState<RepairRequest | null>(null);
  const [inspection, setInspection] = useState<any | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bannerIconRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<RepairRequestStatus | null>(null);

  // Drop the autoOpenChat/firstMsg query params from the URL so a manual
  // refresh (or sharing the link) doesn't re-trigger the auto-open behavior.
  const clearAutoOpenParams = () => {
    if (searchParams.get('autoOpenChat') || searchParams.get('firstMsg')) {
      router.replace(`/${lang}/dashboard/repairs/${id}`, { scroll: false });
    }
  };

  const fetchDetails = async () => {
    try {
      const data = await getRepair(id);
      setRepair(data);

      if (data.selectedOfferId) {
        try {
          const offers = await getOffers(id);
          setSelectedOffer(offers.find(o => o.id === data.selectedOfferId) || null);
        } catch (e) {
          console.warn('Failed to fetch selected offer details', e);
        }
      }

      if ([
        RepairRequestStatus.INSPECTION_DONE, 
        RepairRequestStatus.PAYMENT_PENDING, 
        RepairRequestStatus.PAYMENT_DONE, 
        RepairRequestStatus.PENDING_PROVIDER_REPAIR,
        RepairRequestStatus.PENDING_USER_DEVICE_PICKUP,
        RepairRequestStatus.COMPLETED
      ].includes(data.status)) {
        try {
          const inspData = await getInspectionResults(id);
          setInspection(inspData);
        } catch (e) {
          console.warn('Failed to fetch inspection details', e);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        notFound();
      }
      setError(isAr ? 'فشل تحميل التفاصيل' : 'Failed to load details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, isAr]);

  useGSAP(() => {
    if (!isLoading && repair) {
      const tl = gsap.timeline();
      
      // Banner entrance
      tl.fromTo(bannerIconRef.current, 
        { rotate: -10, scale: 0.9, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );

      // Status badge entrance
      gsap.fromTo(".status-badge", 
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.3 }
      );

      // Section staggers
      gsap.fromTo(".detail-section", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );

      // report line staggers
      gsap.fromTo(".ai-report-line", 
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.4 }
      );

      // timeline items
      gsap.fromTo(".timeline-item", 
        { opacity: 0, x: isAr ? 20 : -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.5 }
      );
    }
  }, [isLoading, !!repair]);

  useEffect(() => {
    if (searchParams.get('autoOpenChat') === 'true') {
      setShowChat(true);
      clearAutoOpenParams();
    }
  }, [searchParams]);

  // Also strip the params the moment the request's status moves on (e.g. the
  // AI diagnostic finished and the request advanced past AI_ASSESSING).
  useEffect(() => {
    if (!repair) return;
    if (prevStatusRef.current !== null && prevStatusRef.current !== repair.status) {
      clearAutoOpenParams();
    }
    prevStatusRef.current = repair.status;
  }, [repair?.status]);

  const handleCancel = async () => {
    if (!repair) return;
    setShowCancelConfirm(false);
    setIsCancelling(true);
    try {
      const updated = await cancelRepair(id);
      setRepair(updated);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || (isAr ? 'فشل الإلغاء' : 'Failed to cancel'));
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusInfo = (status: RepairRequestStatus) => {
    switch (status) {
      case RepairRequestStatus.AI_ASSESSING:
        return {
          label: isAr ? 'تقييم الذكاء الاصطناعي' : 'AI Assessment',
          color: 'bg-blue-100 text-blue-700',
          icon: <Stars size={24} />,
          canCancel: true
        };
      case RepairRequestStatus.PENDING_BRAND_SELECTION:
        return {
          label: isAr ? 'جاري اختيار العلامة التجارية' : 'Selecting Brand',
          color: 'bg-yellow-100 text-yellow-700',
          icon: <Smartphone size={24} />,
          canCancel: true
        };
      case RepairRequestStatus.PENDING_OFFERS:
        return {
          label: isAr ? 'بانتظار العروض' : 'Waiting for Offers',
          color: 'bg-yellow-100 text-yellow-700',
          icon: <Smartphone size={24} />,
          canCancel: true
        };
      case RepairRequestStatus.OFFER_SELECTED:
        return {
          label: isAr ? 'تم اختيار العرض' : 'Offer Selected',
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.INSPECTION_PENDING:
        return {
          label: isAr ? 'بانتظار الفحص' : 'Inspection Pending',
          color: 'bg-purple-100 text-purple-700',
          icon: <InfoCircle size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.INSPECTION_DONE:
        return {
          label: isAr ? 'اكتمل الفحص' : 'Inspection Complete',
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.PAYMENT_PENDING:
        return {
          label: isAr ? 'بانتظار الدفع' : 'Payment Needed',
          color: 'bg-orange-100 text-orange-700',
          icon: <InfoCircle size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.PAYMENT_DONE:
        return {
          label: isAr ? 'اكتمل الدفع' : 'Payment Complete',
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.PENDING_PROVIDER_REPAIR:
        return {
          label: isAr ? 'قيد التصليح' : 'Repairing',
          color: 'bg-purple-100 text-purple-700',
          icon: <Smartphone size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.PENDING_USER_DEVICE_PICKUP:
        return {
          label: isAr ? 'جاهز للاستلام' : 'Ready for Pickup',
          color: 'bg-blue-100 text-blue-700',
          icon: <Smartphone size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.COMPLETED:
        return {
          label: isAr ? 'مكتمل' : 'Completed',
          color: 'bg-gray-100 text-gray-700',
          icon: <CheckCircle size={24} />,
          canCancel: false
        };
      case RepairRequestStatus.CANCELLED:
        return {
          label: isAr ? 'ملغى' : 'Cancelled',
          color: 'bg-secondary-red/5 text-secondary-red',
          icon: <CloseCircle size={24} />,
          canCancel: false
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-700',
          icon: <Smartphone size={24} />,
          canCancel: false
        };
    }
  };

  if (isLoading) {
    return <RepairDetailsSkeleton isAr={isAr} />;
  }

  if (error || !repair) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-white border border-border p-12 rounded-lg max-w-xl mx-auto">
          <div className="w-24 h-24 bg-secondary-red/5 rounded-lg flex items-center justify-center mx-auto mb-8">
            <InfoCircle size={48} className="text-secondary-red" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isAr ? 'لم يتم العثور على الطلب' : 'Request Not Found'}
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed font-medium">
            {error || (isAr 
              ? 'عذراً لا يمكننا العثور على طلب الصيانة الذي تبحث عنه. يرجى التحقق من الرقم والتحول مرة أخرى.' 
              : 'The repair request you are looking for does not exist or has been removed.')}
          </p>
          <button 
            onClick={() => router.back()}
            className="hover-translate inline-flex items-center gap-2 bg-foreground text-white px-8 py-4 rounded-md font-bold transition-all active:scale-95 text-sm uppercase tracking-widest"
          >
            {isAr ? <AltArrowRight size={20} /> : <AltArrowLeft size={20} />}
            {isAr ? 'العودة لطلبات الصيانة' : 'Back to Repairs'}
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(repair.status);

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto py-8 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Breadcrumbs ────────────────────────────────────────── */}
      <nav className={`flex items-center gap-3 text-foreground/40 mb-8 text-xs font-semibold px-2`}>
        <button onClick={() => router.back()} className="hover:text-brand-500 transition-colors uppercase tracking-widest">
          {isAr ? 'طلبات الصيانة' : 'Repair Requests'}
        </button>
        <span className="opacity-20">/</span>
        <span className="text-foreground font-black bg-foreground/5 px-3 py-1.5 rounded-md text-[10px] tracking-[0.1em] uppercase">
          #{repair.id.slice(0, 8)}
        </span>
      </nav>

      {/* ── Page Header Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white border border-border rounded-lg p-8 md:p-10 mb-10 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-brand-500/10 transition-colors duration-700" />
        <div className={`relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10`}>
          <div className={`flex items-start md:items-center gap-6`}>
            <div 
              ref={bannerIconRef}
              className={`w-20 h-20 rounded-lg flex items-center justify-center shrink-0 ${statusInfo.color.replace('bg-', 'bg-opacity-5 bg-')}`}
              style={{ backgroundColor: statusInfo.color.includes('blue') ? 'rgba(2, 84, 255, 0.05)' : undefined }}
            >
              <div className="scale-125 text-brand-500">{statusInfo.icon}</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">
                  {repair.deviceName || (isAr ? 'جهاز غير معروف' : 'Unknown Device')}
                </h1>
                <span className={`status-badge wf-uppercase-label !text-[10px] px-4 py-2 rounded-md font-black tracking-widest ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              
              <div className={`flex flex-wrap items-center gap-5`}>
                <span className="wf-uppercase-label !text-[10px] flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-md border border-border/50 text-foreground/60">
                  <Calendar size={16} className="text-brand-500" />
                  {new Date(repair.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="wf-uppercase-label !text-[10px] flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-md border border-border/50 text-foreground/60">
                  <BillList size={16} className="text-brand-500" />
                  ID-SCRUB: {repair.id.slice(0, 12)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0">
            {repair.flow !== RepairRequestFlow.DIRECT && (
              <button 
                onClick={() => setShowChat(true)}
                className="hover-translate flex items-center gap-3 bg-brand-500 text-white px-10 py-5 rounded-md font-black hover:bg-brand-600 transition-all text-xs uppercase tracking-widest shadow-sm shadow-brand-500/10"
              >
                <ChatUnread size={22} />
                {isAr ? 'المحادثة الذكية' : 'Smart Chat'}
              </button>
            )}
            
            {statusInfo.canCancel && (
              <button 
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
                className="hover-translate flex items-center gap-3 bg-white border border-secondary-red/20 text-secondary-red px-10 py-5 rounded-md font-black hover:bg-secondary-red hover:text-white transition-all active:scale-95 text-xs uppercase tracking-widest shadow-sm shadow-secondary-red/5"
              >
                {isCancelling ? <div className="w-5 h-5 border-2 border-secondary-red/20 border-t-secondary-red rounded-full animate-spin" /> : <CloseCircle size={22} />}
                {isAr ? 'إلغاء الطلب' : 'Cancel Request'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ──────────────────────────────────── */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10`}>
        
        {/* Left Column (Details) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* AI Assessment Section */}
          {repair.aiReport && repair.aiReport.length > 0 && (
            <section className="detail-section relative overflow-hidden bg-white border border-border rounded-lg p-8 md:p-10 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl animate-pulse" />
              <h2 className="wf-uppercase-label !text-[11px] text-foreground/40 mb-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-500 text-white rounded-lg flex items-center justify-center">
                  <Stars size={28} />
                </div>
                {isAr ? 'تقرير التشخيص الذكي' : 'AI Diagnostic Report'}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {repair.aiReport.map((line, idx) => (
                    <div 
                      key={idx}
                      className="ai-report-line flex gap-6 p-6 rounded-md bg-foreground/[0.01] border border-border text-foreground leading-relaxed hover:border-brand-500/20 transition-all group/item"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0 group-hover/item:scale-150 transition-transform" />
                      <p className="text-sm font-semibold text-foreground/80 leading-relaxed tracking-tight">{line}</p>
                    </div>
                ))}
              </div>
            </section>
          )}

          {/* Inspection Results Section */}
          {inspection && (
            <section className="detail-section bg-white border border-secondary-green/20 rounded-lg p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-none">
                    {isAr ? 'نتائج الفحص الفني' : 'Technical Inspection Results'}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {isAr ? 'تم التحقق من عيوب الجهاز يدوياً' : 'Device defects verified manually'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inspection.resultNotes && (
                  <div className="md:col-span-2 space-y-3">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Technician Findings</div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-gray-700 leading-relaxed font-medium">
                      {inspection.resultNotes}
                    </div>
                  </div>
                )}
                
                {inspection.finalPrice && (
                  <div className="space-y-3">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Final Repair Price</div>
                    <div className="text-2xl font-black text-blue-600 flex items-baseline gap-2">
                      {inspection.finalPrice}
                      <span className="text-sm font-bold text-gray-400 uppercase">EGP</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Inspection Date</div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    {new Date(inspection.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {repair.status === RepairRequestStatus.INSPECTION_PENDING && (
            <section className="detail-section relative overflow-hidden bg-white border border-brand-500/20 rounded-lg p-8 md:p-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-brand-500/5 rounded-lg flex items-center justify-center text-brand-500 shrink-0 border border-brand-500/10 transition-all duration-300">
                  <Smartphone size={40} className="animate-pulse" />
                </div>
                <div className="space-y-3 text-center md:text-start">
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    {isAr ? 'جهازك قيد الفحص الآن' : 'Your device is being inspected'}
                  </h3>
                  <p className="text-xs text-foreground/40 font-medium leading-relaxed max-w-md">
                    {isAr 
                      ? 'يقوم فريقنا الفني بفحص جهازك لتحديد الأعطال بدقة. ستتلقى تحديثاً فور اكتمال التقرير الفني.' 
                      : 'Our technical team is currently examining your device to pinpoint the exact issues. You will be notified as soon as the report is ready.'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Payment & Action Blocks */}
          {(repair.status === RepairRequestStatus.OFFER_SELECTED || repair.status === RepairRequestStatus.PAYMENT_PENDING) && (
            <div className="detail-section">
              <PaymentBlock 
                requestId={id} 
                type={repair.status === RepairRequestStatus.OFFER_SELECTED ? 'inspection' : 'final'}
                amount={repair.status === RepairRequestStatus.OFFER_SELECTED
                  ? (selectedOffer?.inspectionPrice || 0)
                  : (inspection?.finalPrice || 0)}
                lang={lang} 
              />
            </div>
          )}

          {repair.status === RepairRequestStatus.COMPLETED && (
            <div className="detail-section">
              {!repair.isReview ? (
                <ReviewForm 
                  requestId={id} 
                  lang={lang} 
                  onSuccess={fetchDetails} 
                />
              ) : repair.review && (
                <div className="bg-white border border-border rounded-lg p-8 md:p-10 relative overflow-hidden group/review hover:border-brand-500/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/review:opacity-20 transition-opacity">
                    <CheckCircle size={80} className="text-secondary-green" />
                  </div>
                  
                  <div className="flex flex-col gap-8 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary-green/5 text-secondary-green rounded-md flex items-center justify-center border border-secondary-green/10">
                          <Star size={20} fill="currentColor" />
                        </div>
                        <h3 className="wf-uppercase-label !text-[12px] !text-foreground font-black">
                          {isAr ? 'تقييمك للخدمة' : 'Your Service Review'}
                        </h3>
                      </div>
                      
                      <div className="flex gap-1.5 bg-foreground/5 p-2 rounded-md border border-border/50">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={16} 
                            className={repair.review!.rating >= s ? 'text-[#ffae13]' : 'text-foreground/10'} 
                            fill={repair.review!.rating >= s ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-secondary-green/20 rounded-full" />
                      <p className="text-[#080808] text-xl font-medium leading-relaxed italic tracking-tight xl:pr-20">
                        "{repair.review.comment}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                      <div className="wf-uppercase-label !text-[10px] flex items-center gap-2">
                        <Calendar size={14} className="text-foreground/40" />
                        {new Date(repair.review.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="wf-uppercase-label !text-[9px] bg-secondary-green/5 text-secondary-green px-3 py-1 rounded-sm border border-secondary-green/10">
                        {isAr ? 'تم التحقق منه' : 'Verified Review'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Issue Description */}
          <section className="detail-section bg-white border border-border rounded-lg p-8 md:p-10">
            <h2 className="wf-uppercase-label !text-[11px] text-foreground/40 mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-foreground/5 rounded-lg flex items-center justify-center">
                <InfoCircle size={28} className="text-foreground/40" />
              </div>
              {isAr ? 'وصف العطل بالتفصيل' : 'Detailed Issue Description'}
            </h2>
            <div className="bg-foreground/[0.01] rounded-md p-8 text-foreground leading-[1.8] text-base font-medium whitespace-pre-wrap border border-border tracking-tight">
              {repair.issueText}
            </div>
          </section>

          {/* Offers Section */}
            <div className="detail-section">
              <OfferSection 
                requestId={id} 
                lang={lang} 
                status={repair.status}
                selectedOfferId={repair.selectedOfferId}
                onAccepted={fetchDetails} 
              />
            </div>
        </div>

        {/* Right Column (Sidebar) */}
        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 self-start">
          
          {/* Device Summary Card */}
          <div className="detail-section bg-brand-500 border border-brand-500/10 rounded-lg p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <p className="wf-uppercase-label !text-[10px] !text-white mb-8 block">
              {isAr ? 'معلومات الجهاز' : 'Device Info'}
            </p>
            
            <div className="space-y-8">
              <div className="flex flex-col gap-1.5">
                <span className="wf-uppercase-label !text-[10px] !text-white">{isAr ? 'اسم الجهاز' : 'Device Name'}</span>
                <span className="text-2xl font-black tracking-tight text-white">{repair.deviceName}</span>
              </div>
              
              {repair.device && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-white/10">
                  <div className="flex flex-col gap-1.5">
                    <span className="wf-uppercase-label !text-[10px] !text-white">Model</span>
                    <span className="text-sm font-bold tracking-tight text-white">{repair.device.deviceModel}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="wf-uppercase-label !text-[10px] !text-white">Platform</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-white">{repair.device.platform}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-md border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-black uppercase !text-white">
                    {i === 0 ? 'TC' : i === 1 ? 'RE' : 'AI'}
                  </div>
                ))}
              </div>
              <span className="wf-uppercase-label !text-[9px] !text-white tracking-widest">Premium Care Active</span>
            </div>
          </div>
          
          {/* Status Timeline Card */}
          <div className="detail-section bg-white border border-border rounded-lg p-8">
            <h3 className="wf-uppercase-label !text-[11px] text-foreground/40 mb-10 flex items-center justify-between">
              <span>{isAr ? 'سجل تتبع الحالة' : 'Status Timeline'}</span>
              <span className="px-3 py-1 bg-secondary-green/5 text-secondary-green rounded-md text-[10px] uppercase font-black tracking-wider border border-secondary-green/10">Live</span>
            </h3>
            
            <div className={`relative ${isAr ? 'pr-10' : 'pl-10'} space-y-12 py-2`}>
              <div className={`absolute ${isAr ? 'right-[19px]' : 'left-[19px]'} top-2 bottom-2 w-px bg-border`} />
              
              {repair.statusLogs.slice().reverse().map((log, idx) => {
                const info = getStatusInfo(log.status);
                const isLatest = idx === 0;
                return (
                  <div 
                    key={idx} 
                    className="timeline-item relative group/step"
                  >
                    <div className={cn(
                      `absolute ${isAr ? '-right-[29.5px]' : '-left-[29.5px]'} top-1.5 w-5 h-5 rounded-full border border-white transition-all duration-500 z-10`,
                      isLatest ? 'bg-brand-500 ring-8 ring-brand-500/5 scale-125' : 'bg-border group-hover/step:bg-brand-500/20'
                    )} />
                    
                    <div className="flex flex-col gap-2">
                      <div className={cn(
                        "font-black text-sm leading-none transition-colors tracking-tight",
                        isLatest ? 'text-foreground' : 'text-foreground/40 group-hover/step:text-foreground/60'
                      )}>
                        {info.label}
                      </div>
                      <div className="wf-uppercase-label !text-[9px] text-foreground/30 p-2 rounded-md bg-foreground/[0.02] self-start group-hover/step:bg-brand-500/5 group-hover/step:text-brand-500 transition-all tracking-widest tabular-nums">
                        {new Date(log.timestamp).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

      </div>

      {/* ── Overlays ───────────────────────────────────────────── */}
      {showChat && (
        <ChatPopup 
          requestId={id} 
          lang={lang} 
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          onSessionFinished={() => { fetchDetails(); clearAutoOpenParams(); }}
          defaultFullScreen={true}
        />
      )}

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title={isAr ? 'إلغاء الطلب' : 'Cancel Request'}
        message={isAr 
          ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.' 
          : 'Are you sure you want to cancel this request? This action cannot be undone.'}
        confirmText={isAr ? 'تأكيد الإلغاء' : 'Confirm Cancel'}
        cancelText={isAr ? 'تراجع' : 'No, keep it'}
        type="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}

export default function RepairDetailsPage({ params }: { params: Promise<{ lang: 'en' | 'ar', id: string }> }) {
  const { lang, id } = React.use(params);
  
  return (
    <Suspense fallback={<RepairDetailsSkeleton isAr={lang === 'ar'} />}>
      <RepairDetailsContent lang={lang} id={id} />
    </Suspense>
  );
}

const RepairDetailsSkeleton = ({ isAr }: { isAr: boolean }) => (
  <div className="max-w-6xl mx-auto py-8 px-4 animate-pulse" dir={isAr ? 'rtl' : 'ltr'}>
    <div className={`flex items-center gap-3 mb-10 px-2`}>
        <div className="h-4 w-24 bg-gray-100 rounded-lg" />
        <div className="h-4 w-4 bg-gray-50 rounded" />
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
    </div>
    
    <div className="bg-white border border-border rounded-lg p-8 md:p-10 mb-10">
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-start`}>
        <div className={`flex items-start md:items-center gap-6`}>
            <div className="w-20 h-20 rounded-lg bg-foreground/[0.03] shrink-0" />
            <div className={`space-y-6`}>
                <div className={`h-12 w-48 md:w-64 bg-foreground/[0.03] rounded-md`} />
                <div className={`flex gap-4`}>
                    <div className="h-8 w-32 bg-foreground/[0.02] rounded-md" />
                    <div className="h-8 w-32 bg-foreground/[0.02] rounded-md" />
                </div>
            </div>
        </div>
        <div className="flex gap-4 shrink-0">
            <div className="w-40 h-16 bg-foreground/[0.03] rounded-md" />
            <div className="w-32 h-16 bg-foreground/[0.02] rounded-md" />
        </div>
      </div>
    </div>
    
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10`}>
      <div className="lg:col-span-8 space-y-10">
          <div className="bg-white border border-border rounded-lg p-10 space-y-10">
            <div className="h-10 w-48 bg-foreground/[0.03] rounded-md mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 w-full bg-foreground/[0.01] border border-border rounded-md" />
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-10 space-y-8">
            <div className="h-8 w-40 bg-foreground/[0.03] rounded-md" />
            <div className="h-56 w-full bg-foreground/[0.01] rounded-md border border-border" />
          </div>

          <div className="space-y-8 mt-12 pb-20 px-4">
            <div className="h-8 w-48 bg-foreground/[0.03] rounded-md" />
            <div className="h-72 w-full bg-white rounded-lg border border-border" />
          </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
          <div className="h-[400px] w-full bg-brand-500 rounded-lg opacity-10" />
          
          <div className="bg-white border border-border rounded-lg p-10 space-y-12">
            <div className="flex justify-between items-center">
              <div className="h-8 w-32 bg-foreground/[0.03] rounded-md" />
              <div className="h-6 w-12 bg-foreground/[0.02] rounded-md" />
            </div>
            <div className="space-y-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <div className="w-6 h-6 rounded-full bg-foreground/[0.05] shrink-0 mt-1" />
                  <div className="space-y-3 flex-1">
                    <div className="h-5 w-32 bg-foreground/[0.03] rounded-md" />
                    <div className="h-4 w-20 bg-foreground/[0.02] rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  </div>
);
