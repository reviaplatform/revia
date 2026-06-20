'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div 
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Technical Overlay */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-0" />
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-0" />

      <div className="flex w-full max-w-sm flex-col gap-0 relative z-10 animate-in fade-in zoom-in-95 duration-1000 ease-[var(--ease-out-expo)]">
        <div className="flex size-32 items-center justify-center self-center overflow-hidden">
          <img 
            src="/revia-logo.png" 
            alt="Revia Logo" 
            className="w-full h-full object-contain brightness-0 invert drop-shadow-[0_0_20px_rgba(20,110,245,0.2)]"
          />
        </div>
        <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>}>
          <ResetPasswordForm className="-mt-6" />
        </Suspense>
      </div>
    </div>
  )
}
