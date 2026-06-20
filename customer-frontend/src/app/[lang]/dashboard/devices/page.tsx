import React from 'react';
import DeviceList from '@/components/dashboard/devices/DeviceList';
import PageHeader from '@/components/dashboard/layout/PageHeader';

export default async function DevicesPage({ params }: { params: Promise<{ lang: 'en' | 'ar' }> }) {
  const { lang } = await params;
  const isAr = lang === 'ar';
  
  return (
    <div className="space-y-8 pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Page Header Banner ─────────────────────────────────── */}
      <PageHeader
        title={isAr ? 'أجهزتي' : 'My Devices'}
        label={isAr ? 'إدارة الأجهزة' : 'Hardware Asset Management'}
        description={isAr 
          ? 'إدارة أسطول أجهزتك الخاصة وإضافة أجهزة جديدة للصيانة بسهولة مع تتبع فوري للضمان والحالة.' 
          : 'Centralized management for your hardware ecosystem. Add new devices and track their warranty status in real-time.'}
        isAr={isAr}
      />

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border p-6 sm:p-10 min-h-[400px]">
        <DeviceList lang={lang} />
      </div>
    </div>
  );
}
