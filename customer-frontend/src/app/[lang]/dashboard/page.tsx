"use client";

import React, { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Smartphone,
  ClipboardCheck,
  CheckCircle,
  Calendar,
  AddCircle,
  ArrowRight,
  Shield,
  InfoCircle,
} from '@solar-icons/react';

import { useRepairs } from '@/hooks/useRepairs';
import { useDevices } from '@/hooks/useDevices';
import { RepairRequestStatus } from '@/lib/api/types';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import PageHeader from '@/components/dashboard/layout/PageHeader';
import { Widget5 } from '@solar-icons/react';

/* ─── Helpers ────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; labelAr: string }> = {
  [RepairRequestStatus.AI_ASSESSING]: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'AI Assessing', labelAr: 'تحليل الذكاء الاصطناعي' },
  [RepairRequestStatus.PENDING_BRAND_SELECTION]: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Select Brand', labelAr: 'اختيار العلامة' },
  [RepairRequestStatus.PENDING_OFFERS]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pending Offers', labelAr: 'في انتظار العروض' },
  [RepairRequestStatus.OFFER_SELECTED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Offer Selected', labelAr: 'تم اختيار العرض' },
  [RepairRequestStatus.INSPECTION_PENDING]: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Inspection', labelAr: 'الفحص' },
  [RepairRequestStatus.INSPECTION_DONE]: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Inspection Done', labelAr: 'تم الفحص' },
  [RepairRequestStatus.PAYMENT_PENDING]: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Payment Pending', labelAr: 'في انتظار الدفع' },
  [RepairRequestStatus.PAYMENT_DONE]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Payment Done', labelAr: 'تم الدفع' },
  [RepairRequestStatus.PENDING_PROVIDER_REPAIR]: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'In Repair', labelAr: 'قيد التصليح' },
  [RepairRequestStatus.PENDING_USER_DEVICE_PICKUP]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ready for Pickup', labelAr: 'جاهز للاستلام' },
  [RepairRequestStatus.COMPLETED]: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Completed', labelAr: 'مكتمل' },
  [RepairRequestStatus.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', labelAr: 'ملغى' },
};

function StatusBadge({ status, isAr }: { status: string; isAr: boolean }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES[RepairRequestStatus.AI_ASSESSING];
  return (
    <span className={`wf-uppercase-label !text-[10px] items-center px-2 py-0.5 rounded-md ${s.bg} ${s.text} border border-border/10`}>
      {isAr ? s.labelAr : s.label}
    </span>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-10">
      {/* Banner Skeleton */}
      <div className="h-64 bg-foreground/5 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer" />
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-lg p-5 space-y-4">
            <div className="w-10 h-10 bg-foreground/5 rounded-md" />
            <div className="space-y-2">
              <div className="h-6 w-12 bg-foreground/5 rounded" />
              <div className="h-4 w-20 bg-foreground/5 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-foreground/5 rounded" />
            <div className="h-4 w-16 bg-foreground/5 rounded" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-foreground/5 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-foreground/5 rounded" />
                  <div className="h-3 w-1/2 bg-foreground/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-32 bg-white border border-border rounded-lg p-5 space-y-3">
             <div className="w-8 h-8 bg-foreground/5 rounded-md" />
             <div className="h-4 w-2/3 bg-foreground/5 rounded" />
          </div>
          <div className="h-64 bg-white border border-border rounded-lg p-5 space-y-4">
            <div className="h-5 w-24 bg-foreground/5 rounded mb-4" />
            {[...Array(3)].map((_, i) => (
               <div key={i} className="flex gap-3">
                 <div className="w-10 h-10 bg-foreground/5 rounded-md" />
                 <div className="flex-1 space-y-2">
                   <div className="h-4 w-full bg-foreground/5 rounded" />
                   <div className="h-3 w-2/3 bg-foreground/5 rounded" />
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function DashboardPage({ params }: { params: Promise<{ lang: 'en' | 'ar' }> }) {
  const { lang } = React.use(params);
  const { user } = useAuth();
  const isAr = lang === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: repairs, isLoading: repairsLoading, error: repairsError } = useRepairs();
  const { devices, isLoading: devicesLoading, error: devicesError } = useDevices();

  useGSAP(() => {
    if (!repairsLoading && !devicesLoading) {
      gsap.fromTo(".dashboard-item", 
        { opacity: 0, y: 18 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.08, 
          ease: "power2.out",
          delay: 0.1 
        }
      );
    }
  }, [repairsLoading, devicesLoading]);

  const activeRepairsCount = repairs.filter(r => r.status !== RepairRequestStatus.COMPLETED && r.status !== RepairRequestStatus.CANCELLED).length;
  const devicesCount = devices?.length || 0;

  const stats = [
    {
      icon: <ClipboardCheck size={22} />,
      label: isAr ? 'طلبات نشطة' : 'Active Repairs',
      value: activeRepairsCount,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: <Smartphone size={22} />,
      label: isAr ? 'أجهزتي' : 'My Devices',
      value: devicesCount,
      color: 'from-violet-500 to-violet-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      icon: <CheckCircle size={22} />,
      label: isAr ? 'مكتملة' : 'Completed',
      value: repairs.filter(r => r.status === RepairRequestStatus.COMPLETED).length,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  if (repairsLoading || devicesLoading) {
    return <DashboardSkeleton />;
  }

  if (repairsError || devicesError) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-foreground/[0.01] rounded-lg border border-dashed border-border" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 bg-secondary-red/5 rounded-lg flex items-center justify-center mb-6 text-secondary-red">
          <InfoCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">
          {isAr ? 'عذراً، حدث خطأ في النظام' : 'Systems Offline'}
        </h3>
        <p className="text-xs text-foreground/40 font-medium max-w-xs leading-relaxed mb-8">
          {isAr 
            ? 'لم نتمكن من مزامنة بيانات لوحة التحكم الخاصة بك. يرجى المحاولة مرة أخرى.' 
            : 'We encountered a synchronization error while retrieving your dashboard data. Please attempt a manual refresh.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="hover-translate px-8 py-3 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-md shadow-lg shadow-brand-500/20"
        >
          {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 pb-10" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Welcome Banner ────────────────────────────────────────── */}
      <PageHeader
        title={user?.name || (isAr ? 'المستخدم' : 'User')}
        label={isAr ? 'مرحباً بك في ريفيا 👋' : 'Welcome back to Revia 👋'}
        description={isAr
          ? 'لديك طلبات صيانة نشطة. تابع تقدمها من هنا وإدارة أجهزتك بكفاءة.'
          : 'You have active repair requests. Track their progress right here and manage your hardware ecosystem.'}
        isAr={isAr}
      >
        <Link
          href={`/${lang}/dashboard/repairs`}
          className="hover-translate inline-flex items-center justify-center gap-2 bg-white text-brand-500 font-bold px-8 py-4 rounded-md text-xs uppercase tracking-widest hover:bg-white/90 transition-all"
        >
          <ClipboardCheck size={18} />
          {isAr ? 'طلبات الصيانة' : 'View Repairs'}
        </Link>
        <Link
          href={`/${lang}/dashboard/devices`}
          className="hover-translate inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-md text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md"
        >
          <AddCircle size={18} />
          {isAr ? 'إضافة جهاز' : 'Add Device'}
        </Link>
      </PageHeader>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="dashboard-item group hover-translate bg-white border border-border rounded-lg p-6 sm:p-7 hover:border-brand-500/40 transition-all duration-500"
          >
            <div className={`w-12 h-12 rounded-lg ${s.bgLight} ${s.textColor} flex items-center justify-center mb-5 border border-current/10 transition-transform duration-500`}>
              {s.icon}
            </div>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-1">{s.value}</p>
            <p className="wf-uppercase-label !text-[10px] text-foreground/40 font-bold tracking-[0.15em]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Repairs + Quick Actions ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Repairs */}
        <div className="dashboard-item lg:col-span-2 bg-white border border-border rounded-lg overflow-hidden min-h-[300px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-foreground/[0.01]">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">{isAr ? 'آخر طلبات الصيانة' : 'Recent Repairs'}</h2>
            <Link
              href={`/${lang}/dashboard/repairs`}
              className="flex items-center gap-1 text-brand-500 text-xs font-semibold hover:gap-2 transition-all uppercase tracking-wider"
            >
              {isAr ? 'عرض الكل' : 'View all'} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {repairs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4 text-foreground/20">
                  <ClipboardCheck size={28} />
                </div>
                <h3 className="text-foreground font-semibold mb-1">{isAr ? 'لا توجد طلبات' : 'Nothing here yet'}</h3>
                <p className="text-xs text-foreground/40 max-w-[200px] leading-relaxed">
                  {isAr ? 'ابدأ طلب صيانة جديد لتتبع تقدمه هنا.' : 'Start a new repair request to track its progress here.'}
                </p>
              </div>
            ) : repairs.slice(0, 5).map((repair) => {
              const s = STATUS_STYLES[repair.status] ?? STATUS_STYLES[RepairRequestStatus.AI_ASSESSING];
              return (
                <Link
                  key={repair.id}
                  href={`/${lang}/dashboard/repairs/${repair.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-brand-500/[0.02] transition-colors group mx-2 my-1 rounded-lg"
                >
                  <div className={`w-11 h-11 rounded-lg flex-shrink-0 flex items-center justify-center ${s.bg} ${s.text} border border-border/10 transition-transform`}>
                    <Smartphone size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate group-hover:text-brand-500 transition-colors">{repair.device?.name || (isAr ? 'جهاز' : 'Device')}</p>
                    <p className="text-[11px] text-foreground/40 font-medium truncate mt-0.5">{repair.issueText}</p>
                  </div>
                  <div className="flex-shrink-0 text-right space-y-1.5">
                    <StatusBadge status={repair.status} isAr={isAr} />
                    <p className="text-[10px] text-foreground/30 flex items-center justify-end gap-1 font-bold tracking-tight">
                      <Calendar size={10} />
                      {new Date(repair.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions + Device Summary */}
        <div className="space-y-4">
          {/* Protection Banner */}
          <div className="dashboard-item bg-foreground/[0.02] border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-md bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/5">
                <Shield size={18} />
              </div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest">{isAr ? 'الحماية نشطة' : 'Protection Active'}</p>
            </div>
            <p className="text-[11px] text-foreground/50 leading-relaxed font-normal">
              {isAr
                ? 'جميع أجهزتك مغطاة بضمان الصيانة لمدة 90 يوماً.'
                : 'All your devices are covered by a 90-day repair warranty.'}
            </p>
          </div>

          {/* My Devices mini-list */}
          <div className="dashboard-item bg-white border border-border rounded-lg overflow-hidden min-h-[200px]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-foreground/[0.01]">
              <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-widest">{isAr ? 'أجهزتي' : 'My Devices'}</h2>
              <Link href={`/${lang}/dashboard/devices`} className="text-brand-500 text-[10px] font-bold hover:gap-1.5 transition-all flex items-center gap-1 uppercase tracking-widest">
                {isAr ? 'الكل' : 'All'} <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {devices.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="w-10 h-10 rounded-md bg-foreground/5 flex items-center justify-center mb-3 text-foreground/20">
                      <Smartphone size={20} />
                    </div>
                    <p className="text-[11px] text-foreground/40 font-medium">{isAr ? 'لم تقم بإضافة أي أجهزة بعد.' : 'No devices added yet.'}</p>
                 </div>
              ) : devices.slice(0, 3).map((device) => (
                <div key={device.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-foreground/[0.01] transition-colors">
                  <div className="w-8 h-8 rounded-md bg-brand-500/5 text-brand-500 flex items-center justify-center flex-shrink-0 border border-brand-500/10">
                    <Smartphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{device.name}</p>
                    <p className="text-[10px] text-foreground/40 capitalize font-medium">{device.platform} · {device.manufacturer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
