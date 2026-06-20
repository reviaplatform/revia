"use client";

import React, { useState } from 'react';
import { sendOtp } from '@/lib/api/auth';
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface PhoneStepProps {
  onSuccess: (phoneNumber: string, isExistingUser: boolean) => void;
  lang: "en" | "ar";
}

export default function PhoneStep({ onSuccess, lang }: PhoneStepProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = React.useRef<HTMLFormElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { duration: 0.6, ease: "power2.out", force3D: true }
    });

    // Entrance for the input field
    tl.from(".phone-input-field", {
      autoAlpha: 0,
      x: -20,
    })
    // Entrance for the button (starts slightly after input)
    .from(".phone-action", {
      autoAlpha: 0,
      y: 20,
      duration: 0.7,
      ease: "power3.out",
    }, "-=0.4");
  }, { scope: containerRef });

  // Animate error message
  useGSAP(() => {
    if (error) {
      gsap.fromTo(errorRef.current,
        { height: 0, autoAlpha: 0, scale: 0.95 },
        { height: "auto", autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out", force3D: true }
      );
    }
  }, { dependencies: [error], scope: containerRef });

  const normalizePhone = (value: string): string => {
    const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let normalized = value;
    for (let i = 0; i < 10; i++) {
      normalized = normalized.replace(arabicDigits[i], String(i));
    }
    return normalized.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError(lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required');
      return;
    }
    
    if (trimmedPhone.length !== 11) {
      setError(
        lang === 'ar'
          ? 'يجب أن يتكون رقم الهاتف من 11 رقماً'
          : 'Phone number must be exactly 11 characters'
      );
      return;
    }

    const isValidPrefix = /^(010|011|012|015)/.test(trimmedPhone);
    if (!isValidPrefix) {
      setError(
        lang === 'ar'
          ? 'يجب أن يبدأ رقم الهاتف بـ 010 أو 011 أو 012 أو 015'
          : 'Phone number must start with 010, 011, 012, or 015'
      );
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await sendOtp(trimmedPhone, lang);
      // res.user: 1 = existing, 0 = new
      onSuccess(trimmedPhone, res.user === 1);
    } catch (err: any) {
      if (err.response?.data?.error?.code === 'PHONE_INVALID') {
        setError(lang === 'ar' ? 'رقم الجوال غير صالح' : 'Invalid phone number format');
      } else {
        setError(lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form ref={containerRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="phone-input-field will-change-transform-opacity">
        <label htmlFor="phone" className="wf-uppercase-label !text-[11px] mb-2 block text-foreground/60">
          {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
        </label>
        <div className="relative" dir="ltr">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              const val = normalizePhone(e.target.value);
              if (val.length <= 11) {
                setPhone(val);
              }
            }}
            disabled={isLoading}
            placeholder="01012345678"
            className="w-full pl-11 pr-4 py-3.5 border border-border rounded-md focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-foreground/5 disabled:text-foreground/40 transition-all outline-none text-foreground font-medium"
          />
        </div>
        {error && (
          <div ref={errorRef} className="overflow-hidden will-change-transform-opacity">
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="phone-action will-change-transform-opacity">
        <Button
          type="submit"
          isLoading={isLoading}
          loadingText={lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-md mt-2 transition-all shadow-lg shadow-brand-500/20"
        >
          {lang === 'ar' ? 'إرسال الرمز' : 'Send OTP'}
        </Button>
      </div>
    </form>
  );
}
