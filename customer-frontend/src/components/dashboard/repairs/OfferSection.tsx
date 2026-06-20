"use client";

import React, { useState, useEffect } from 'react';
import { Offer, RepairRequestStatus } from '@/lib/api/types';
import { getOffers, acceptOffer, getRemainingOffersStatus, RemainingOffersStatus } from '@/lib/api/offers';
import { ClockCircle, CheckCircle, MapPoint, Star, InfoCircle } from '@solar-icons/react';
import ConfirmModal from '@/components/ui/confirm-modal';

interface OfferSectionProps {
  requestId: string;
  lang: 'en' | 'ar';
  status: RepairRequestStatus;
  selectedOfferId?: string | null;
  onAccepted: () => void;
}

export default function OfferSection({ requestId, lang, status, selectedOfferId, onAccepted }: OfferSectionProps) {
  const isAr = lang === 'ar';
  const [offers, setOffers] = useState<Offer[]>([]);
  const [remainingStatus, setRemainingStatus] = useState<RemainingOffersStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [confirmOfferId, setConfirmOfferId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffersAndStatus = async () => {
      try {
        const [offersData, statusData] = await Promise.all([
          getOffers(requestId),
          getRemainingOffersStatus(requestId),
        ]);
        setOffers(offersData);
        setRemainingStatus(statusData);
      } catch (err) {
        console.error('Failed to fetch offers/status', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffersAndStatus();
  }, [requestId]);

  const isCancelled = status === RepairRequestStatus.CANCELLED;

  const handleAccept = async () => {
    if (!confirmOfferId || isCancelled) return;
    const offerId = confirmOfferId;
    setConfirmOfferId(null);
    setIsAccepting(offerId);
    try {
      await acceptOffer(requestId, offerId);
      onAccepted();
    } catch (err) {
      console.error('Failed to accept offer', err);
    } finally {
      setIsAccepting(null);
    }
  };

  if (isLoading) return null;
  
  // Filter for selected offer if it exists
  const displayedOffers = selectedOfferId 
    ? offers.filter(o => o.id === selectedOfferId)
    : offers;

  if (displayedOffers.length === 0) {
    if (status === RepairRequestStatus.PENDING_OFFERS || status === RepairRequestStatus.AI_ASSESSING) {
      const isNoProviders = remainingStatus && remainingStatus.remainingCount === 0;
      return (
        <section className="mt-8" dir={isAr ? 'rtl' : 'ltr'}>
          <h2 className="wf-uppercase-label !text-[11px] text-foreground/40 mb-6 px-4">
            {selectedOfferId ? (isAr ? 'العرض المختار' : 'Selected Offer') : (isAr ? 'العروض المتاحة' : 'Available Offers')}
          </h2>
          <div className="bg-white border border-border border-dashed rounded-lg p-12 text-center flex flex-col items-center gap-6">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center border transition-all duration-300 ${isNoProviders ? 'bg-secondary-red/5 text-secondary-red border-secondary-red/10' : 'bg-brand-500/5 text-brand-500 border-brand-500/10'}`}>
              {isNoProviders ? (
                <InfoCircle size={32} />
              ) : (
                <ClockCircle size={32} className="animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                {isNoProviders 
                  ? (isAr ? 'لا يوجد مقدمي خدمة متاحين' : 'No providers available now')
                  : (isAr ? 'في انتظار العروض...' : 'Waiting for offers...')}
              </h3>
              <p className="text-xs text-foreground/40 font-medium leading-relaxed max-w-sm">
                {isNoProviders ? (
                  isAr 
                    ? 'نأسف، لم نتمكن من العثور على مقدمي خدمة متاحين لعطل جهازك حالياً.'
                    : 'We apologize, but no service providers are available for your device repair at the moment.'
                ) : (
                  isAr 
                    ? 'سيقوم مزودو الخدمة بإرسال عروضهم قريباً. ستتلقى إشعاراً فور وصول أول عرض.' 
                    : 'Service providers will send their offers shortly. You will be notified as soon as the first offer arrives.'
                )}
              </p>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="mt-12" dir={isAr ? 'rtl' : 'ltr'}>
      <h2 className="wf-uppercase-label !text-[11px] text-foreground/40 mb-8 px-4 flex items-center gap-3 tracking-tight">
        {selectedOfferId ? (isAr ? 'العرض المختار' : 'Selected Offer') : (isAr ? 'العروض المتاحة' : 'Available Offers')}
        {!selectedOfferId && <span className="flex h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />}
      </h2>

      {remainingStatus && remainingStatus.remainingCount === 0 && !selectedOfferId && (
        <div className="mb-6 mx-4 p-4 bg-brand-500/5 border border-brand-500/10 text-brand-500 rounded-md flex items-center gap-3 text-xs font-semibold tracking-tight">
          <InfoCircle size={16} className="shrink-0" />
          <span>
            {isAr 
              ? 'لا يوجد المزيد من مقدمي الخدمة. يرجى الاختيار من العروض أدناه.' 
              : 'No more providers will send offers. Select from the offers below.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {displayedOffers.map((offer) => {
          let minPrice = 0;
          let maxPrice = 0;
          if (offer.offerItems?.length > 0) {
            minPrice = Math.min(...offer.offerItems.map(item => item.priceRange?.min ?? 0));
            maxPrice = Math.max(...offer.offerItems.map(item => item.priceRange?.max ?? 0));
          }

          let latestDate: Date | null = null;
          if (offer.offerItems?.length > 0) {
            latestDate = offer.offerItems
              .map(item => new Date(item.expectedFinishDate))
              .sort((a, b) => b.getTime() - a.getTime())[0];
          }

          return (
            <div key={offer.id} className="bg-white border border-border rounded-lg p-6 flex flex-col gap-6 hover-translate">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border bg-white flex-shrink-0 transition-all group-hover:border-brand-500/20">
                    <img 
                      src={offer.brand?.logo || '/images/placeholder.png'} 
                      alt={offer.brand?.name || 'Brand Logo'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-foreground text-lg tracking-tight leading-none mb-2">{offer.brand?.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-foreground/50">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Star size={14} className="text-secondary-yellow fill-secondary-yellow" />
                        <span className="text-foreground tracking-tight">{offer.brand?.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-[10px] text-foreground/30 font-medium tracking-tight">({offer.brand?.ratingCount || 0})</span>
                      </div>
                      <div className="w-px h-3 bg-border/60" />
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPoint size={14} className="text-brand-500" />
                        <span className="text-foreground tracking-tight">{offer.distanceKm} {isAr ? 'كم' : 'km'}</span>
                      </div>
                    </div>
                    <div className="wf-uppercase-label !text-[9px] text-foreground/30 mt-2.5 tracking-widest">
                       {offer.brand?.completedRepairs} {isAr ? 'إصلاحات مكتملة' : 'completed repairs'}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block">
                  {selectedOfferId === offer.id ? (
                    <div className="bg-secondary-green/5 text-secondary-green px-8 py-3.5 rounded-md wf-uppercase-label !text-[11px] border border-secondary-green/10 flex items-center gap-2.5 font-black">
                       <CheckCircle size={18} />
                       {isAr ? 'تم قبول العرض' : 'OFFER ACCEPTED'}
                    </div>
                  ) : isCancelled ? (
                    <div className="bg-secondary-red/5 text-secondary-red px-8 py-3.5 rounded-md wf-uppercase-label !text-[11px] border border-secondary-red/10 font-black">
                      {isAr ? 'الطلب ملغي' : 'REQUEST CANCELLED'}
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmOfferId(offer.id)}
                      disabled={isAccepting !== null || selectedOfferId !== null}
                      className="hover-translate bg-brand-500 text-white px-10 py-4 rounded-md font-black hover:bg-brand-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px] uppercase tracking-widest active:scale-95"
                    >
                      {isAccepting === offer.id ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-md animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      {isAr ? 'قبول العرض' : 'Accept Offer'}
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-border" />

              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex flex-col gap-4 flex-1">
                  <div className="wf-uppercase-label !text-[10px] text-brand-500 mb-2">
                    {isAr ? 'تفاصيل العرض' : 'Offer Details'}
                  </div>
                  {offer.offerItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm font-semibold tracking-tight">
                      <span className="text-foreground/40">{item.expectedIssue}</span>
                      <span className="text-foreground tabular-nums tracking-tighter">
                        {item.priceRange.min} - {item.priceRange.max} <span className="wf-uppercase-label !text-[9px] ml-1.5 text-foreground/30">{isAr ? 'ج.م' : 'EGP'}</span>
                      </span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-dashed border-border mt-2 font-semibold">
                    <span className="text-foreground/40">{isAr ? 'رسوم الفحص' : 'Inspection Fee'}</span>
                    <span className="text-foreground tabular-nums tracking-tighter">
                      {offer.inspectionPrice} <span className="wf-uppercase-label !text-[9px] ml-1.5 text-foreground/30">{isAr ? 'ج.م' : 'EGP'}</span>
                    </span>
                  </div>
                </div>

                <div className="w-px bg-border hidden lg:block" />

                <div className="flex flex-row lg:flex-col gap-8 lg:gap-6 justify-between lg:justify-start min-w-[200px]">
                  <div className="flex flex-col gap-2">
                    <div className="wf-uppercase-label !text-[9px] text-brand-500/60 uppercase tracking-widest leading-none">
                      {isAr ? 'إجمالي التكلفة المتوقعة' : 'Estimated Total Cost'}
                    </div>
                    <div className="text-2xl font-black text-brand-500 flex items-baseline gap-1.5 tabular-nums tracking-tighter">
                      {minPrice} - {maxPrice}
                      <span className="text-[10px] font-black opacity-40 ml-1.5 uppercase tracking-widest">{isAr ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="wf-uppercase-label !text-[9px] text-foreground/30 uppercase tracking-widest leading-none">
                      {isAr ? 'تاريخ الانتهاء المتوقع' : 'Est. Finish Date'}
                    </div>
                    <div className="text-sm font-black text-foreground flex items-center gap-2.5 mt-0.5 tabular-nums tracking-tight">
                      <ClockCircle size={14} className="text-brand-500 opacity-60" />
                      {latestDate ? latestDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="block sm:hidden w-full mt-2">
                {selectedOfferId === offer.id ? (
                  <div className="bg-secondary-green/5 text-secondary-green w-full py-4 rounded-md wf-uppercase-label !text-[11px] font-black text-center border border-secondary-green/10 flex items-center justify-center gap-2.5">
                    <CheckCircle size={18} />
                    {isAr ? 'تم قبول العرض' : 'OFFER ACCEPTED'}
                  </div>
                ) : isCancelled ? (
                  <div className="bg-secondary-red/5 text-secondary-red w-full py-4 rounded-md wf-uppercase-label !text-[11px] font-black text-center border border-secondary-red/10">
                    {isAr ? 'الطلب ملغي' : 'REQUEST CANCELLED'}
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmOfferId(offer.id)}
                    disabled={isAccepting !== null || selectedOfferId !== null}
                    className="hover-translate bg-brand-500 text-white w-full py-4 rounded-md font-black hover:bg-brand-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[11px] uppercase tracking-widest"
                  >
                    {isAccepting === offer.id ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-md animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    {isAr ? 'قبول العرض' : 'Accept Offer'}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={confirmOfferId !== null}
        onClose={() => setConfirmOfferId(null)}
        onConfirm={handleAccept}
        title={isAr ? 'قبول العرض' : 'Accept Offer'}
        message={isAr 
          ? 'هل أنت متأكد من رغبتك في قبول هذا العرض؟ سيتم بدء إجراءات الصيانة وسنقوم بالتواصل معك لتحديد موعد الزيارة.' 
          : 'Are you sure you want to accept this offer? This will initiate the repair process, and we\'ll contact you to schedule the visit.'}
        confirmText={isAr ? 'تأكيد القبول' : 'Confirm'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        type="primary"
        isLoading={isAccepting !== null}
      />
    </section>
  );
}
