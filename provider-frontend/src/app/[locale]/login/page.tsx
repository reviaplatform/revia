'use client';

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div 
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Technical Overlay */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-0" />

      <div className="flex w-full max-w-sm flex-col gap-0 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-[var(--ease-out-expo)]">
        <div className="flex size-32 items-center justify-center self-center overflow-hidden">
          <img 
            src="/revia-logo.png" 
            alt="Revia Logo" 
            className="w-full h-full object-contain brightness-0 invert drop-shadow-[0_0_20px_rgba(20,110,245,0.2)]"
          />
        </div>
        <LoginForm className="-mt-6" />
      </div>
    </div>
  )
}
