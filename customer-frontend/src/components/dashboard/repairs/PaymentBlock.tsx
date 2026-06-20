"use client";

import React, { useState } from 'react';
import { payInspection, payFinal } from '@/lib/api/repairs';
import { CardRecive, BillList, CheckCircle } from '@solar-icons/react';

interface PaymentBlockProps {
  requestId: string;
  type: 'inspection' | 'final';
  amount: number;
  lang: 'en' | 'ar';
}

export default function PaymentBlock({ requestId, type, amount, lang }: PaymentBlockProps) {
  const isAr = lang === 'ar';
  const [isInitiating, setIsInitiating] = useState(false);

  const handlePay = async () => {
    setIsInitiating(true);
    try {
      const { paymentUrl } = type === 'inspection' 
        ? await payInspection(requestId)
        : await payFinal(requestId);
      
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
      } else {
        throw new Error('Payment URL not found');
      }
    } catch (err) {
      console.error('Failed to initiate payment', err);
      alert(isAr ? 'فشل بدء عملية الدفع' : 'Failed to start payment process');
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="bg-brand-500 border border-brand-500/10 rounded-lg p-8 text-white mb-8 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="wf-uppercase-label !text-[10px] !text-white flex items-center gap-2.5">
            <BillList size={18} />
            {type === 'inspection' 
              ? (isAr ? 'رسوم الفحص مطلوبة' : 'Inspection Fee Required')
              : (isAr ? 'المبلغ النهائي المطلوب' : 'Final Payment Required')}
          </div>
          <h3 className="text-4xl font-black tracking-tighter tabular-nums text-white">
            {amount} <span className="text-sm font-black text-white uppercase tracking-widest ml-2">EGP</span>
          </h3>
          <p className="text-white text-xs font-semibold max-w-sm leading-relaxed">
            {isAr 
              ? 'يرجى إتمام عملية الدفع للمتابعة في صيانة جهازك.' 
              : 'Please complete the payment to proceed with your device repair.'}
          </p>
        </div>

        <button
          onClick={handlePay}
          disabled={isInitiating}
          className="hover-translate bg-white text-brand-500 px-10 py-5 rounded-md font-black hover:bg-brand-50 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest active:scale-95"
        >
          {isInitiating ? (
            <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 rounded-md animate-spin" />
          ) : (
            <CheckCircle size={20} />
          )}
          {isAr ? 'ادفع الآن' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}
