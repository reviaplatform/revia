"use client";

import React, { useState } from 'react';
import { cn, isValidEgyptPhone } from "@/lib/utils"
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
import { Link, useRouter } from '@/navigation';
import { AltArrowLeft } from '@solar-icons/react';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!isValidEgyptPhone(phoneNumber)) {
      toast.error('Phone number must be 11 digits and start with 010, 011, 012 or 015');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', {
        phoneNumber,
        languagePreference: 'en',
      });

      toast.success('OTP sent to your phone number');
      router.push(`/reset-password?phone=${encodeURIComponent(phoneNumber)}`);
    } catch (error: any) {
      console.error('Forgot password error detailed:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      }, null, 2));
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please write a valid registered number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="card-clean border-none shadow-2xl md:shadow-xl overflow-hidden rounded-wf-lg bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center pt-10 pb-4 relative border-b border-slate-100/50">
          <CardTitle className="text-2xl font-bold tracking-tighter text-slate-950 font-display">Reset Identity</CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1 font-medium italic">
            Secure recovery process
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 pb-10 relative">
          <form onSubmit={handleRequestOtp} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group/field">
                <div className="flex items-center justify-between px-1">
                  <FieldLabel htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">
                    Authorized Phone Number
                  </FieldLabel>
                </div>
                <div className="relative group/input">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01X XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    required
                    minLength={11}
                    maxLength={11}
                    className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium px-1">
                  You will receive a one-time security code.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-black uppercase tracking-[0.2em] transition-all rounded-wf-lg bg-primary hover:bg-primary-vibrant text-white shadow-lg shadow-primary/20 active:scale-[0.98]" 
                isLoading={isLoading}
              >
                {isLoading ? 'Sending Request' : 'Authorize Recovery'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-wf-lg"
                onClick={() => router.push('/login')}
                disabled={isLoading}
              >
                <AltArrowLeft className="size-4 mr-2" />
                Return to Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="px-6 space-y-2">
        <p className="text-center text-[10px] text-white/60 font-medium leading-relaxed">
          Need support? <Link href="#" className="text-white hover:underline transition-colors font-bold">Contact technical helpdesk</Link>
        </p>
      </div>
    </div>
  )
}
