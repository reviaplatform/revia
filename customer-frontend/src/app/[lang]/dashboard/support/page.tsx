"use client";

import React, { useState } from 'react';
import { useSupport } from '@/hooks/useSupport';
import TicketList from '@/components/dashboard/support/TicketList';
import CreateTicketForm from '@/components/dashboard/support/CreateTicketForm';
import { AddCircle, InfoCircle } from '@solar-icons/react';

/* ─── Skeleton ────────────────────────────────────────────────── */
function SupportSkeleton() {
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

export default function SupportPage({ params }: { params: Promise<{ lang: 'en' | 'ar' }> }) {
  const { lang } = React.use(params);
  const isAr = lang === 'ar';
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: tickets, isLoading, error, refetch } = useSupport();

  return (
    <div className="space-y-8 pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Page Header Banner ─────────────────────────────────── */}
      {!showCreateForm && (
        <div className="relative overflow-hidden bg-brand-500 rounded-lg p-6 sm:p-10 text-white border border-brand-500/10 transition-all duration-300">
          <div className="absolute top-0 end-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-white opacity-[0.05] rounded-full -translate-y-1/2 translate-x-1/3 rtl:-translate-x-1/3 pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="wf-uppercase-label !text-brand-50/70 mb-3 tracking-[0.2em] leading-none">
                {isAr ? 'مركز المساعدة' : 'Support Center'}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
                {isAr ? 'تذاكر الدعم' : 'Support Tickets'}
              </h1>
              <p className="text-brand-50/80 max-w-sm leading-relaxed font-normal text-sm sm:text-base">
                {isAr 
                  ? 'تواصل مع فريق الدعم الفني لدينا لحل أي مشكلات تواجهها.' 
                  : 'Contact our technical support team to resolve any issues you encounter.'}
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="hover-translate inline-flex items-center justify-center gap-2 bg-white text-brand-500 px-8 py-4 rounded-md text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/90 active:scale-95 shadow-xl shadow-black/10 w-full md:w-auto"
            >
              <AddCircle size={20} />
              {isAr ? 'تذكرة جديدة' : 'New Ticket'}
            </button>
          </div>
        </div>
      )}

      {showCreateForm ? (
        <div className="bg-white rounded-lg border border-border p-6 sm:p-10 shadow-2xl shadow-foreground/5">
          <CreateTicketForm 
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
            <SupportSkeleton />
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
                  ? 'لم نتمكن من جلب تذاكر الدعم الخاصة بك. يرجى المحاولة مرة أخرى لاحقاً.' 
                  : 'We encountered an error while retrieving your support tickets. Please try again later.'}
              </p>
              <button 
                onClick={() => refetch()}
                className="hover-translate px-8 py-3 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-md shadow-lg shadow-brand-500/20"
              >
                {isAr ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : (
            <TicketList tickets={tickets || []} lang={lang} />
          )}
        </div>
      )}
    </div>
  );
}
