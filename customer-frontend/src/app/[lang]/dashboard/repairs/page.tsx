"use client";

import React, { useState } from 'react';
import { useRepairs } from '@/hooks/useRepairs';
import RepairRequestList from '@/components/dashboard/repairs/RepairRequestList';
import CreateRepairForm from '@/components/dashboard/repairs/CreateRepairForm';
import { AddCircle, InfoCircle } from '@solar-icons/react';
import PageHeader from '@/components/dashboard/layout/PageHeader';

/* ─── Skeleton ────────────────────────────────────────────────── */
function RepairsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border border-border rounded-lg bg-white">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-foreground/5 rounded-md flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 bg-foreground/5 rounded-md" />
              <div className="h-3 w-64 bg-foreground/[0.02] rounded-md" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-5 w-20 bg-foreground/5 rounded-md" />
            <div className="h-3 w-24 bg-foreground/[0.02] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RepairsPage({ params }: { params: Promise<{ lang: 'en' | 'ar' }> }) {
  const { lang } = React.use(params);
  const isAr = lang === 'ar';
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: repairs, isLoading, error, refetch } = useRepairs();

  return (
    <div className="space-y-8 pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Page Header Banner ─────────────────────────────────── */}
      {!showCreateForm && (
        <PageHeader
          title={isAr ? 'طلبات الصيانة' : 'Repair Requests'}
          label={isAr ? 'مركز الصيانة' : 'Service Hub'}
          description={isAr 
            ? 'تتبع حالة طلبات الصيانة الحالية والسابقة وقم بإدارة أجهزتك بكفاءة من الفحص وحتى الاستلام.' 
            : 'Track and manage the lifecycle of your repair requests from diagnostic AI assessment to final delivery.'}
          isAr={isAr}
        >
          <button
            onClick={() => setShowCreateForm(true)}
            className="hover-translate flex items-center justify-center gap-2 bg-white text-brand-500 px-8 py-4 rounded-md font-bold transition-all hover:bg-brand-50 active:scale-95 uppercase text-xs tracking-widest"
          >
            <AddCircle size={20} />
            {isAr ? 'فتح طلب جديد' : 'New Repair Request'}
          </button>
        </PageHeader>
      )}

      {showCreateForm ? (
        <div className="bg-white rounded-lg border border-border p-6 sm:p-10">
          <CreateRepairForm 
            lang={lang} 
            onSuccess={() => {
              setShowCreateForm(false);
              refetch();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border p-6 sm:p-10 min-h-[400px]">
          {isLoading ? (
            <RepairsSkeleton />
          ) : error ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 bg-foreground/[0.01] rounded-lg border border-dashed border-border">
              <div className="w-16 h-16 bg-secondary-red/5 rounded-lg flex items-center justify-center mb-6 text-secondary-red">
                <InfoCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {isAr ? 'عذراً، حدث خطأ ما' : 'Connection Interrupted'}
              </h3>
              <p className="text-xs text-foreground/40 font-medium max-w-xs leading-relaxed mb-8">
                {isAr 
                  ? 'لم نتمكن من جلب طلبات الصيانة الخاصة بك. يرجى المحاولة مرة أخرى لاحقاً.' 
                  : 'We encountered a synchronization error while retrieving your requests. Please attempt a manual refresh.'}
              </p>
              <button 
                onClick={() => refetch()}
                className="hover-translate px-8 py-3 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-md shadow-lg shadow-brand-500/20"
              >
                {isAr ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : (
            <RepairRequestList repairs={repairs || []} lang={lang} />
          )}
        </div>
      )}
    </div>
  );
}
