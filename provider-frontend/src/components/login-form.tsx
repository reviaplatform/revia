"use client";

import React, { useState } from 'react';
import { Eye, EyeClosed, Phone } from '@solar-icons/react';
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
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from '@/navigation';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidEgyptPhone(phoneNumber)) {
      toast.error('Phone number must be 11 digits and start with 010, 011, 012 or 015');
      return;
    }

    const payload = {
      phoneNumber,
      password,
      languagePreference: 'en',
    };

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', payload);
      toast.success('Login successful!');
      login(response.data.data.accessToken, '/dashboard');
    } catch (error: any) {
      console.error('Login error detailed:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      }, null, 2));
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="card-clean border-none shadow-2xl md:shadow-xl overflow-hidden rounded-wf-lg bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center pt-10 pb-4 relative border-b border-slate-100/50">
          <CardTitle className="text-2xl font-bold tracking-tighter text-slate-950 font-display">Welcome back</CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1 font-medium">
            Access your provider dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 pb-10 relative">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group/field">
                <div className="flex items-center justify-between px-1">
                  <FieldLabel htmlFor="phoneNumber" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">
                    Phone Number
                  </FieldLabel>
                </div>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors pointer-events-none group-focus-within/input:text-primary">
                    <Phone className="size-5" />
                  </div>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="01X XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    required
                    minLength={11}
                    maxLength={11}
                    className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base pl-12 pr-4 rounded-wf border-wf-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2 group/field">
                <div className="flex items-center justify-between px-1">
                  <FieldLabel htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">
                    Password
                  </FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-wider"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group/input">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 pr-12 rounded-wf border-wf-border"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeClosed className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-bold transition-all rounded-wf-lg bg-primary hover:bg-primary-vibrant text-white shadow-lg shadow-primary/20 active:scale-[0.98]" 
                isLoading={isLoading}
              >
                {isLoading ? 'Processing' : 'Sign In to Revia'}
              </Button>
              <p className="text-center text-xs text-slate-500 font-medium">
                New to Revia? <Link href="/signup" className="font-bold text-primary hover:text-primary-vibrant transition-colors">Create account</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="px-6 space-y-2">
        <p className="text-center text-[10px] text-white/60 font-medium leading-relaxed">
          By continuing, you agree to our <Link href="#" className="text-white hover:underline transition-colors">Terms of Service</Link>{" "}
          and <Link href="#" className="text-white hover:underline transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

