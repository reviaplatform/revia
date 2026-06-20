"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '@/lib/api/profile';
import { useAuth } from '@/context/AuthContext';

interface DeleteAccountSectionProps {
  lang: "en" | "ar";
}

export default function DeleteAccountSection({ lang }: DeleteAccountSectionProps) {
  const isAr = lang === 'ar';
  const router = useRouter();
  const { logout } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteAccount();
      logout();
      router.push(`/${lang}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || (isAr ? 'حدث خطأ أثناء حذف الحساب' : 'Failed to delete account'));
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 overflow-hidden rounded-lg">
      <div className="flex flex-col gap-2 mb-6">
        <p className="wf-uppercase-label !text-[10px] text-secondary-red tracking-widest opacity-80">
          {isAr ? 'منطقة الخطر' : 'Critical Hazard Zone'}
        </p>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          {isAr ? 'حذف الحساب بصفة نهائية' : 'Decommission Account'}
        </h2>
      </div>
      
      <p className="text-xs text-foreground/40 font-medium leading-relaxed mb-8 max-w-2xl">
        {isAr 
          ? 'بمجرد حذف حسابك، سيتم مسح جميع بياناتك، معلوماتك الشخصية، وسجل طلبات الصيانة بشكل نهائي من خوادمنا. لا يمكن التراجع عن هذا الإجراء.' 
          : 'Upon decommissioning, all personal data, repair logs, and platform interactions will be permanently scrubbed from our systems. This operation is irreversible.'}
      </p>

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="hover-translate bg-white border border-secondary-red/20 text-secondary-red font-bold px-8 py-3.5 rounded-md hover:bg-secondary-red hover:text-white transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-sm shadow-secondary-red/5"
        >
          {isAr ? 'بدء إجراء الحذف' : 'Initiate Deletion'}
        </button>
      ) : (
        <div className="p-8 bg-secondary-red/[0.03] border border-secondary-red/10 rounded-md space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-bold text-secondary-red tracking-tight leading-relaxed">
            {isAr 
              ? 'هل أنت متأكد تماماً؟ يرجى كتابة "DELETE" للمتابعة.'
              : 'Protocol verification required. Type "DELETE" below to authorize permanent scrub.'}
          </p>
          
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isLoading}
            placeholder='DELETE'
            dir="ltr"
            className="w-full max-w-xs px-5 py-4 border border-secondary-red/20 rounded-md focus:outline-none focus:ring-4 focus:ring-secondary-red/5 focus:border-secondary-red/40 bg-white text-foreground font-black tracking-[0.2em] text-center placeholder:opacity-20 transition-all"
          />
          
          {error && <p className="text-[11px] text-secondary-red font-bold uppercase tracking-widest">{error}</p>}
          
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleDelete}
              disabled={isLoading || confirmText !== 'DELETE'}
              className="flex-1 bg-secondary-red text-white font-black px-8 py-4 rounded-md hover:bg-secondary-red/90 disabled:opacity-30 disabled:scale-100 transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest shadow-sm shadow-secondary-red/20 active:scale-95"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              )}
              {isAr ? 'تأكيد الحذف النهائي' : 'Execute Permanent Delete'}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setConfirmText('');
                setError(null);
              }}
              disabled={isLoading}
              className="flex-1 bg-white border border-border text-foreground/40 font-bold px-8 py-4 rounded-md hover:bg-foreground/[0.03] transition-all text-[11px] uppercase tracking-widest active:scale-95"
            >
              {isAr ? 'إلغاء الإجراء' : 'Abort Mission'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
