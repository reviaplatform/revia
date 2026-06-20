"use client";

import React from 'react';
import { RepairRequest, RepairRequestStatus } from '@/lib/api/types';
import { Smartphone, Calendar, InfoCircle, Stars } from '@solar-icons/react';
import Link from 'next/link';

interface RepairRequestListProps {
  repairs: RepairRequest[];
  lang: 'en' | 'ar';
}

export default function RepairRequestList({ repairs, lang }: RepairRequestListProps) {
  const isAr = lang === 'ar';

  const getStatusColor = (status: RepairRequestStatus) => {
    switch (status) {
      case RepairRequestStatus.AI_ASSESSING: return 'bg-brand-500/10 text-brand-500';
      case RepairRequestStatus.PENDING_BRAND_SELECTION:
      case RepairRequestStatus.PENDING_OFFERS: return 'bg-secondary-yellow/10 text-secondary-yellow';
      case RepairRequestStatus.OFFER_SELECTED:
      case RepairRequestStatus.INSPECTION_DONE:
      case RepairRequestStatus.PAYMENT_DONE: return 'bg-secondary-green/10 text-secondary-green';
      case RepairRequestStatus.INSPECTION_PENDING:
      case RepairRequestStatus.PENDING_PROVIDER_REPAIR: return 'bg-secondary-purple/10 text-secondary-purple';
      case RepairRequestStatus.PAYMENT_PENDING: return 'bg-secondary-orange/10 text-secondary-orange';
      case RepairRequestStatus.PENDING_USER_DEVICE_PICKUP: return 'bg-brand-500/10 text-brand-500';
      case RepairRequestStatus.COMPLETED: return 'bg-foreground/5 text-foreground/60';
      case RepairRequestStatus.CANCELLED: return 'bg-secondary-red/10 text-secondary-red';
      default: return 'bg-foreground/5 text-foreground/60';
    }
  };

  const getStatusLabel = (status: RepairRequestStatus) => {
    if (isAr) {
      switch (status) {
        case RepairRequestStatus.AI_ASSESSING: return 'تقييم الذكاء الاصطناعي';
        case RepairRequestStatus.PENDING_BRAND_SELECTION: return 'جاري اختيار العلامة التجارية';
        case RepairRequestStatus.PENDING_OFFERS: return 'بانتظار العروض';
        case RepairRequestStatus.OFFER_SELECTED: return 'تم اختيار العرض';
        case RepairRequestStatus.INSPECTION_PENDING: return 'بانتظار الفحص';
        case RepairRequestStatus.INSPECTION_DONE: return 'اكتمل الفحص';
        case RepairRequestStatus.PAYMENT_PENDING: return 'بانتظار الدفع';
        case RepairRequestStatus.PAYMENT_DONE: return 'اكتمل الدفع';
        case RepairRequestStatus.PENDING_PROVIDER_REPAIR: return 'قيد التصليح';
        case RepairRequestStatus.PENDING_USER_DEVICE_PICKUP: return 'جاهز للاستلام';
        case RepairRequestStatus.COMPLETED: return 'مكتمل';
        case RepairRequestStatus.CANCELLED: return 'ملغى';
        default: return status;
      }
    }
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (repairs.length === 0) {
    return (
      <div className="bg-white border border-border border-dashed rounded-lg p-12 text-center">
        <InfoCircle size={48} className="mx-auto text-foreground/20 mb-4" />
        <p className="text-foreground/40 font-medium">
          {isAr ? 'لا توجد طلبات صيانة حالية.' : 'No active repair requests.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repairs.map((repair) => (
        <div key={repair.id} className="group hover-translate bg-white border border-border rounded-lg p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:border-brand-500/30">
          
          <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-500 ${getStatusColor(repair.status)} border border-current/10`}>
              {repair.status === RepairRequestStatus.AI_ASSESSING ? <Stars size={24} /> : <Smartphone size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate max-w-[200px]">
                  {repair.deviceName || (isAr ? 'جهاز غير معروف' : 'Unknown Device')}
                </h3>
                <span className={`wf-uppercase-label !text-[10px] px-2 py-0.5 rounded-sm border border-current/10 ${getStatusColor(repair.status)}`}>
                  {getStatusLabel(repair.status)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/50 line-clamp-1 font-normal tracking-tight mb-3 sm:mb-2">{repair.issueText}</p>
              <div className="flex items-center gap-4 text-[11px] text-foreground/30 tabular-nums font-medium">
                <span className="flex items-center gap-1.5 bg-foreground/[0.03] px-2 py-0.5 rounded-sm">
                  <Calendar size={12} />
                  {new Date(repair.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </span>
                <span className="opacity-60 uppercase tracking-widest bg-foreground/[0.03] px-2 py-0.5 rounded-sm">ID: {repair.id.slice(-6)}</span>
              </div>
            </div>
          </div>
          
          <Link 
            href={`/${lang}/dashboard/repairs/${repair.id}`}
            className="hover-translate bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all duration-300 text-center shadow-lg shadow-brand-500/20 w-full md:w-auto"
          >
            {isAr ? 'عرض التفاصيل' : 'View Details'}
          </Link>
        </div>
      ))}
    </div>
  );
}
