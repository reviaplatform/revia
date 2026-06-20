"use client";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import {
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/Input"
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/navigation';
import { ShieldCheck, LockPassword, Restart, Eye, EyeClosed } from '@solar-icons/react';

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get('phone') || '';

  const [phoneNumber, setPhoneNumber] = useState(phoneFromQuery);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step, setStep] = useState<'VERIFY_OTP' | 'RESET_PASSWORD'>('VERIFY_OTP');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && step === 'VERIFY_OTP') {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/verify-password-otp', {
        phoneNumber,
        otp,
        languagePreference: 'en'
      });
      toast.success('OTP Verified');
      setStep('RESET_PASSWORD');
    } catch (error: any) {
      console.error('Verify OTP error detailed:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      }, null, 2));
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        phoneNumber,
        newPassword,
        otp,
        languagePreference: 'en'
      });
      toast.success('Password reset successfully! Please log in.');
      router.push('/login');
    } catch (error: any) {
      console.error('Reset password error detailed:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      }, null, 2));
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { phoneNumber, languagePreference: 'en' });
      toast.success('New OTP sent');
      setCountdown(60);
    } catch (error: any) {
      console.error('Resend OTP error detailed:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      }, null, 2));
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="card-clean border-none shadow-2xl md:shadow-xl overflow-hidden rounded-wf-lg bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center pt-10 pb-4 relative border-b border-slate-100/50">
          <div className="mx-auto size-14 bg-primary/5 rounded-wf-lg flex items-center justify-center mb-6 border border-primary/10 shadow-inner">
            {step === 'VERIFY_OTP' ? (
              <ShieldCheck className="size-7 text-primary" />
            ) : (
              <LockPassword className="size-7 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tighter text-slate-950 font-display">
            {step === 'VERIFY_OTP' ? 'Security Check' : 'Finalize Access'}
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1 max-w-[280px] mx-auto font-medium italic">
            {step === 'VERIFY_OTP' 
              ? `Verification code sent to registration phone`
              : 'Create a highly secure entry credential'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 pb-10 relative">
          {step === 'VERIFY_OTP' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="space-y-6">
                {!phoneFromQuery && (
                   <div className="space-y-2 group/field">
                    <FieldLabel htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">Phone Number</FieldLabel>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                      required
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                )}
                <div className="space-y-3 group/field">
                  <div className="flex items-center justify-between px-1">
                    <FieldLabel htmlFor="otp" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">Verification Protocol (6-Digits)</FieldLabel>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    className="h-16 text-center text-3xl tracking-[0.4em] font-mono bg-slate-50/50 text-slate-950 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all rounded-wf-lg shadow-sm shadow-black/[0.02]"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-medium px-1 text-center">
                    Reference phone ending in <span className="text-slate-900 font-bold">*{phoneNumber.slice(-4)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-black uppercase tracking-[0.2em] transition-all rounded-wf-lg bg-primary hover:bg-primary-vibrant text-white shadow-xl shadow-primary/20 active:scale-[0.98]" 
                  isLoading={isLoading}
                >
                  Verify Protocol
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isLoading}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 w-full h-10 rounded-wf-lg",
                      countdown > 0 ? "text-slate-300 cursor-not-allowed" : "text-primary hover:bg-primary/5 active:scale-[0.98]"
                    )}
                  >
                    <Restart className={cn("size-4", isLoading && "animate-spin")} />
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Request New Payload'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 ease-[var(--ease-out-expo)]">
              <div className="space-y-6">
                <div className="space-y-2 group/field">
                  <FieldLabel htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">New Access Key</FieldLabel>
                  <div className="relative group/input">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 pr-12 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeClosed className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 group/field">
                  <FieldLabel htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">Confirm Access Key</FieldLabel>
                  <div className="relative group/input">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 pr-12 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeClosed className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-black uppercase tracking-[0.2em] transition-all rounded-wf-lg bg-primary hover:bg-primary-vibrant text-white shadow-xl shadow-primary/20 active:scale-[0.98]" 
                  isLoading={isLoading}
                >
                  Finalize Access Key
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="flex items-center justify-center gap-2 px-6">
         <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Remembered?</span>
         <Link href="/login" className="text-[10px] font-black text-white uppercase tracking-widest hover:text-primary-light transition-colors underline underline-offset-4">Back to Entry</Link>
      </div>
    </div>
  )
}
