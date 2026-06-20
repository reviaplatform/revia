'use client';

import React, { useEffect, useState, useRef } from 'react';
import { subscriptionService } from '@/services/subscriptionService';
import { PricingInfo, Subscription } from '@/types/subscription';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, CheckCircle, ClockCircle, InfoCircle, Star, Crown, Bolt } from '@solar-icons/react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTranslations, useLocale } from 'next-intl';

export default function SubscriptionPage() {
  const t = useTranslations('Subscription');
  const locale = useLocale();
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const activatedAt = subscription?.activatedAt ? new Date(subscription.activatedAt) : null;
  const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;

  let daysRemaining = 0;
  let totalDays = subscription?.durationDays || 30;
  let progressPercent = 0;

  if (subscription?.status === 'active' && activatedAt && expiresAt) {
    const remainingTime = expiresAt.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
    progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
  } else if (subscription?.status === 'expired') {
    daysRemaining = 0;
    progressPercent = 0;
  }

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pricingData, subData] = await Promise.all([
        subscriptionService.getPricing(),
        subscriptionService.getMySubscription(),
      ]);
      setPricing(pricingData);
      setSubscription(subData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useGSAP(() => {
    if (!isLoading) {
      gsap.from('.reveal-item', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power4.out',
      });
    }
  }, { scope: containerRef, dependencies: [isLoading] });

  const handleRequestSubscription = async () => {
    try {
      setIsRequesting(true);
      await subscriptionService.requestSubscription();
      toast.success(t('messages.requestSuccess'));
      fetchData();
    } catch (error: any) {
      if (error.response?.data?.code === 'activeSubscriptionExists') {
        toast.error(t('messages.alreadyExists'));
      } else {
        toast.error(t('messages.requestError'));
      }
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
        <div className="space-y-4 text-start">
          <Skeleton className="h-6 w-32 rounded-wf" />
          <Skeleton className="h-14 w-full max-w-xl rounded-wf" />
          <Skeleton className="h-4 w-full max-w-md rounded-wf" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 p-8 space-y-8 bg-white border border-wf-border">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24 rounded-wf" />
              <Skeleton className="size-10 rounded-wf" />
            </div>
            <Skeleton className="h-24 w-full rounded-wf" />
            <div className="space-y-4 py-6 border-y border-wf-border">
              <Skeleton className="h-12 w-3/4" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
            <Skeleton className="h-12 w-full rounded-wf" />
          </Card>
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 space-y-8 bg-white border border-wf-border">
              <div className="flex justify-between items-center pb-6 border-b border-wf-border">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24 rounded-wf" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-32 w-full rounded-wf" />
                <Skeleton className="h-32 w-full rounded-wf" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-24 w-full rounded-wf" />
                <Skeleton className="h-24 w-full rounded-wf" />
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48 w-full rounded-wf" />
              <Skeleton className="h-48 w-full rounded-wf" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-wf bg-wf-green/10 text-wf-green border border-wf-green/20">
            <div className="size-1.5 rounded-full bg-wf-green animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[1px] font-ui">{t('active')}</span>
          </div>
        );
      case 'pending_payment':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-wf bg-wf-orange/10 text-wf-orange border border-wf-orange/20">
            <ClockCircle className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-[1px] font-ui">{t('pendingPayment')}</span>
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-wf bg-wf-red/10 text-wf-red border border-wf-red/20">
            <InfoCircle className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-[1px] font-ui">{t('expired')}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} ref={containerRef} className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="reveal-item space-y-4 text-start">
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-wf bg-wf-purple/10 text-wf-purple border border-wf-purple/20">
          <Crown className="size-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] font-ui">{t('membership')}</span>
        </div>
        <h1 className="text-wf-text-section md:text-wf-text-display font-semibold tracking-[-0.8px] text-wf-near-black leading-[1.04]">
          {locale === 'ar' ? (
            <>إدارة <span className="text-wf-blue">الاشتراك</span></>
          ) : (
            <>Subscription <span className="text-wf-blue">Management</span></>
          )}
        </h1>
        <p className="text-wf-gray-700 text-lg md:text-xl font-medium max-w-2xl leading-[1.4] tracking-[-0.16px]">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="reveal-item lg:col-span-1">
          <div className="relative bg-white rounded-wf border border-wf-border p-8 shadow-none transition-all duration-300 hover:border-wf-blue/50 group text-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 rounded-wf bg-wf-blue text-white text-[10px] font-bold uppercase tracking-[1.5px]">
                    {t('proPlan')}
                  </span>
                  <div className="size-10 rounded-wf bg-wf-blue/5 flex items-center justify-center text-wf-blue border border-wf-blue/10">
                    <Bolt className="size-5" />
                  </div>
                </div>
                <div>
                  <h2 className="text-wf-text-feature font-semibold text-wf-near-black leading-[1.3]">{t('fullAccess')}</h2>
                  <p className="text-xs text-wf-gray-300 font-medium mt-1">{t('unlockFeatures')}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 py-6 border-y border-wf-border">
                <span className="text-[48px] font-semibold text-wf-near-black font-ui tabular-nums tracking-[-0.8px]">
                  {pricing?.priceEGP}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-wf-blue font-ui">{t('currency')}</span>
                  <span className="text-[10px] font-bold text-wf-gray-300 uppercase tracking-[1px]">{t('perDuration', { days: pricing?.durationDays ?? 0 })}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-semibold text-wf-gray-700 uppercase tracking-[1.5px]">{t('includedFeatures')}</p>
                <ul className="space-y-4">
                  {[
                    t('features.aiRepair'),
                    t('features.support')
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="size-5 rounded-full bg-wf-green/10 text-wf-green flex items-center justify-center shrink-0">
                        <CheckCircle className="size-3" />
                      </div>
                      <span className="text-xs font-medium text-wf-near-black">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleRequestSubscription}
                  disabled={isRequesting || (subscription?.status === 'active' || subscription?.status === 'pending_payment')}
                  className="w-full h-12 rounded-wf bg-wf-blue hover:bg-wf-blue/90 text-white font-semibold uppercase tracking-[1.5px] text-[15px] transition-all duration-300 hover:translate-x-1.5 shadow-none"
                >
                  {isRequesting ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{t('processing')}</span>
                    </div>
                  ) : (
                    t('upgradeButton')
                  )}
                </Button>

                {subscription?.status === 'pending_payment' && (
                  <div className="mt-4 p-4 rounded-wf bg-wf-orange/5 border border-wf-orange/20 flex flex-col items-center gap-2">
                    <p className="text-[10px] text-center font-bold text-wf-orange uppercase tracking-[1px] flex items-center gap-1.5">
                      <ClockCircle className="size-3" /> {t('pendingPayment')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Status & Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Status Section */}
          <div className="reveal-item bg-white rounded-wf border border-wf-border p-8 shadow-none text-start">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-wf-border">
              <h3 className="text-xl font-semibold flex items-center gap-3 text-wf-near-black">
                <div className="size-8 rounded-wf bg-wf-blue/10 flex items-center justify-center text-wf-blue">
                  <Star className="size-4" />
                </div>
                {t('status')}
              </h3>
              {subscription && getStatusBadge(subscription.status)}
            </div>

            {subscription ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-wf bg-slate-50 border border-wf-border group hover:border-wf-blue/30 transition-colors">
                    <p className="text-[10px] font-semibold text-wf-gray-700 uppercase tracking-[1.5px] mb-3">{t('reference')}</p>
                    <div className="flex items-center justify-between bg-white border border-wf-border rounded-wf px-4 py-3 font-mono text-[11px] text-wf-near-black">
                      {subscription.id}
                      <Button variant="ghost" size="icon-xs" className="text-wf-gray-300 hover:text-wf-blue">
                        <InfoCircle className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 rounded-wf bg-slate-50 border border-wf-border space-y-3">
                    <p className="text-[10px] font-semibold text-wf-gray-700 uppercase tracking-[1.5px]">{t('usage')}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5 text-wf-gray-300">
                          <span>{t('usageLabel')}</span>
                          <span className={
                            subscription.status === 'active' ? 'text-wf-blue font-ui' :
                            subscription.status === 'pending_payment' ? 'text-wf-orange font-ui' :
                            'text-wf-red font-ui'
                          }>
                            {subscription.status === 'active' ? t('daysRemaining', { count: daysRemaining }) : 
                             subscription.status === 'pending_payment' ? t('pendingPayment') : 
                             t('expired')}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-wf-border rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              subscription.status === 'active' ? 'bg-wf-blue' :
                              subscription.status === 'pending_payment' ? 'bg-wf-orange' :
                              'bg-wf-red'
                            }`}
                            style={{ width: `${progressPercent}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-wf bg-white border border-wf-border space-y-2 hover:bg-slate-50 transition-colors">
                    <div className="size-8 rounded-wf bg-wf-green/5 text-wf-green flex items-center justify-center mb-2">
                      <CheckCircle className="size-4" />
                    </div>
                    <p className="text-[10px] font-semibold text-wf-gray-700 uppercase tracking-[1.5px]">{t('activatedOn')}</p>
                    <p className="text-lg font-semibold text-wf-near-black font-ui">
                      {activatedAt ? activatedAt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="p-6 rounded-wf bg-white border border-wf-border space-y-2 hover:bg-slate-50 transition-colors">
                    <div className="size-8 rounded-wf bg-wf-red/5 text-wf-red flex items-center justify-center mb-2">
                      <ClockCircle className="size-4" />
                    </div>
                    <p className="text-[10px] font-semibold text-wf-gray-700 uppercase tracking-[1.5px]">{t('expiresOn')}</p>
                    <p className={`text-lg font-semibold font-ui ${subscription.status === 'active' ? 'text-wf-green' : 'text-wf-red'}`}>
                      {expiresAt ? expiresAt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>

                {subscription.status === 'pending_payment' && (
                  <div className="p-6 rounded-wf bg-wf-blue/5 border border-wf-blue/10 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-wf bg-wf-blue/10 flex items-center justify-center text-wf-blue shrink-0">
                        <InfoCircle className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-wf-near-black uppercase tracking-[1px] text-sm">{t('actionRequired')}</h4>
                        <p className="text-xs text-wf-gray-700 leading-relaxed font-medium">
                          {t('actionRequiredDesc', { price: subscription.price })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 space-y-6">
                <div className="relative inline-block">
              <div className="size-20 rounded-wf bg-slate-50 flex items-center justify-center text-wf-gray-300 mx-auto border border-wf-border">
                    <Wallet className="size-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 size-8 rounded-full bg-white border border-wf-border flex items-center justify-center text-wf-red">
                    <InfoCircle className="size-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-wf-near-black text-xl mb-2">{t('readyToScale')}</h4>
                  <p className="text-sm text-wf-gray-700 font-medium max-w-sm mx-auto leading-[1.6]">
                    {t('readyToScaleDesc')}
                  </p>
                </div>
                <Button 
                  onClick={() => document.querySelector('button')?.scrollIntoView({ behavior: 'smooth' })}
                  variant="outline" 
                  className="rounded-wf h-10 px-8 font-semibold uppercase tracking-[1.5px] text-[12.8px] border-wf-border hover:border-wf-blue hover:text-wf-blue"
                >
                  {t('viewPlans')}
                </Button>
              </div>
            )}
          </div>

          <div className="reveal-item grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-wf p-8 border border-wf-border flex flex-col justify-between group hover:border-wf-blue/50 transition-all shadow-none text-start">
              <div className="space-y-4">
                <div className="size-12 rounded-wf bg-wf-blue/5 flex items-center justify-center text-wf-blue border border-wf-blue/10">
                  <Bolt className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-wf-near-black leading-[1.3]">{t('growthEngine')}</h3>
                <p className="text-xs text-wf-gray-700 font-medium leading-[1.6]">
                  {t('growthEngineDesc')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-wf p-8 border border-wf-border flex flex-col justify-between group hover:border-wf-purple/50 transition-all shadow-none text-start">
              <div className="space-y-4">
                <div className="size-12 rounded-wf bg-wf-purple/5 flex items-center justify-center text-wf-purple border border-wf-purple/10">
                  <Star className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-wf-near-black leading-[1.3]">{t('premiumSupport')}</h3>
                <p className="text-xs text-wf-gray-700 font-medium leading-[1.6]">
                  {t('premiumSupportDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
