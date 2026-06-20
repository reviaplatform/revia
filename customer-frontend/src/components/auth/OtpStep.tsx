"use client";

import React, { useState, useEffect } from 'react';
import { validateExistUserOtp, validateNotExistUserOtp, sendOtp } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface OtpStepProps {
  phoneNumber: string;
  isExistingUser: boolean | null;
  lang: "en" | "ar";
  onSuccess: (payload?: any) => void;
  onBack: () => void;
}

export default function OtpStep({ phoneNumber, isExistingUser, lang, onSuccess, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; attemptsRemaining?: number } | null>(null);

  // Timer & Lockout state
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for OTP expiry
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);


  const { setSession } = useAuth();
  const containerRef = React.useRef<HTMLFormElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { duration: 0.6, ease: "power2.out", force3D: true }
    });

    // Entrance for the instructions
    tl.from(".otp-instructions", {
      autoAlpha: 0,
      y: 10,
    })
    // Pop in for the OTP input (starts slightly after instructions)
    .from(".otp-input-wrapper", {
      scale: 0.95,
      autoAlpha: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    }, "-=0.4")
    // Stagger for buttons and footer (starts right after input)
    .from(".otp-action", {
      autoAlpha: 0,
      y: 15,
      stagger: 0.1,
      ease: "power3.out",
    }, "-=0.3");
  }, { scope: containerRef });

  // Animate error message
  useGSAP(() => {
    if (error) {
      gsap.fromTo(errorRef.current,
        { height: 0, autoAlpha: 0, y: -5 },
        { height: "auto", autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", force3D: true }
      );
    }
  }, { dependencies: [error], scope: containerRef });

  useEffect(() => {
    if (lockoutTime !== null) {
      if (lockoutTime <= 0) {
        setLockoutTime(null);
      } else {
        const timerId = setInterval(() => setLockoutTime(prev => prev! - 1), 1000);
        return () => clearInterval(timerId);
      }
    } else if (timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return; // Simple validation for 6 digits

    setIsLoading(true);
    setError(null);
    try {
      if (isExistingUser === true) {
        console.log('User exists (from send-otp), validating login...');
        const res: any = await validateExistUserOtp(phoneNumber, otp, lang);
        
        const accessToken = res.accessToken || res.access_token;
        const refreshToken = res.refreshToken || res.refresh_token;
        
        // Calculate expires in seconds from accessTokenExpireTime ISO string
        let expiresIn = 3600; // Default 1 hour
        if (res.accessTokenExpireTime) {
          expiresIn = Math.floor((new Date(res.accessTokenExpireTime).getTime() - Date.now()) / 1000);
        } else if (res.expiresIn) {
          expiresIn = res.expiresIn;
        }

        if (accessToken) {
          setSession(accessToken, expiresIn, refreshToken, res as any);
          onSuccess();
        } else {
          throw new Error('No access token received');
        }
      } else if (isExistingUser === false) {
        console.log('User is new (from send-otp), validating registration...');
        const resNew = await validateNotExistUserOtp(phoneNumber, otp, lang);
        onSuccess({ registerToken: resNew.registerToken });
      } else {
        // Fallback: Try existing user first per specs if we don't know
        try {
          console.log('User existence unknown, trying login validation first...');
          const res: any = await validateExistUserOtp(phoneNumber, otp, lang);
          const accessToken = res.accessToken || res.access_token;
          const refreshToken = res.refreshToken || res.refresh_token;
          let expiresIn = 3600;
          if (res.accessTokenExpireTime) {
            expiresIn = Math.floor((new Date(res.accessTokenExpireTime).getTime() - Date.now()) / 1000);
          }
          if (accessToken) {
            setSession(accessToken, expiresIn, refreshToken, res as any);
            onSuccess();
          } else {
            throw new Error('No token');
          }
        } catch (err: any) {
          console.log('🔑 Login Fallback Failed:', err.response?.data || err.message);
          const data = err.response?.data?.error || err.response?.data;
          const message = data?.message;
          if (err.response?.status === 400 && (message?.includes('not exist') || message?.includes('not found'))) {
            console.log('Login failed (not exists), trying registration...');
            const resNew = await validateNotExistUserOtp(phoneNumber, otp, lang);
            onSuccess({ registerToken: resNew.registerToken });
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      const desc = err.response?.data?.error?.message;
      const attempts = err.response?.data?.error?.attemptsRemaining;

      if (code === 'OTP_INVALID') {
        setError({
          message: lang === 'ar' ? 'الرمز غير صحيح' : 'Invalid OTP code',
          attemptsRemaining: attempts
        });
      } else if (code === 'OTP_EXPIRED') {
        setError({ message: lang === 'ar' ? 'انتهت صلاحية الرمز' : 'OTP has expired' });
      } else if (code === 'OTP_LOCKED') {
        setError({ message: lang === 'ar' ? 'تم قفل الحساب مؤقتاً' : 'Too many attempts. Locked.' });
        setLockoutTime(15 * 60); // 15 minutes lockout
      } else {
        setError({ message: desc || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendOtp(phoneNumber, lang);
      setTimeLeft(120);
      setOtp('');
    } catch (err: any) {
      setError({ message: lang === 'ar' ? 'فشل إعادة الإرسال' : 'Failed to resend OTP' });
    } finally {
      setIsLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (lockoutTime !== null) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {lang === 'ar' ? 'محاولات كثيرة جداً' : 'Too many attempts'}
        </h3>
        <p className="text-gray-500">
          {lang === 'ar'
            ? `يرجى المحاولة مرة أخرى بعد ${formatTime(lockoutTime)}`
            : `Please try again after ${formatTime(lockoutTime)}`}
        </p>
      </div>
    );
  }

  return (
    <form ref={containerRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="otp-instructions text-center mb-6 will-change-transform-opacity">
        <p className="text-sm text-gray-500">
          {lang === 'ar' ? 'أدخل الرمز المكون من 6 أرقام المرسل إلى' : 'Enter the 6-digit code sent to'}
        </p>
        <p className="font-medium mt-1" dir="ltr">{phoneNumber}</p>
      </div>

      <div className="otp-input-wrapper will-change-transform-opacity">
        <div className="relative" dir="ltr">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            disabled={isLoading || timeLeft === 0}
            className="w-full text-center tracking-[1em] text-3xl font-mono px-4 py-4 border border-border rounded-md focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-foreground/5 transition-all outline-none text-foreground"
            placeholder="••••••"
          />
        </div>

        {error && (
          <div ref={errorRef} className="overflow-hidden will-change-transform-opacity">
            <div className="mt-2 text-sm text-red-600 flex justify-between">
              <span>{error.message}</span>
              {error.attemptsRemaining !== undefined && (
                <span>{error.attemptsRemaining} {lang === 'ar' ? 'محاولات متبقية' : 'attempts left'}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="otp-action will-change-transform-opacity">
        <Button
          type="submit"
          isLoading={isLoading}
          loadingText={lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
          disabled={otp.length < 6 || timeLeft === 0}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-md transition-all shadow-lg shadow-brand-500/20"
        >
          {lang === 'ar' ? 'تحقق' : 'Verify'}
        </Button>
      </div>

      <div className="otp-action text-center mt-6 text-sm will-change-transform-opacity">
        {timeLeft > 0 ? (
          <p className="text-gray-500">
            {lang === 'ar' ? 'إعادة الإرسال بعد' : 'Resend code in'} <span className="font-medium text-gray-900">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="text-[#0454ff] font-bold hover:underline"
          >
            {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
          </button>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={onBack}
            className="wf-uppercase-label !text-[10px] text-foreground/40 hover:text-brand-500 transition-colors font-black tracking-widest"
          >
            {lang === 'ar' ? 'تغيير رقم الهاتف' : 'Change phone number'}
          </button>
        </div>
      </div>
    </form>
  );
}
