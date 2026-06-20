"use client";

import React, { useState } from 'react';
import { register } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { AltArrowDown } from '@solar-icons/react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RegisterStepProps {
  registerToken: string;
  lang: "en" | "ar";
  onSuccess: () => void;
}

export default function RegisterStep({ registerToken, lang, onSuccess }: RegisterStepProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<"male" | "female" | ''>('');
  const [birthday, setBirthday] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { setSession } = useAuth();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = lang === 'ar' ? 'يرجى إدخال اسمك بالكامل' : 'Please enter your full name';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)' : 'Please enter a valid email address (e.g., name@example.com)';
    if (!gender) newErrors.gender = lang === 'ar' ? 'يرجى اختيار الجنس' : 'Please select your gender';
    
    if (!birthday) {
      newErrors.birthday = lang === 'ar' ? 'يرجى اختيار تاريخ ميلادك' : 'Please select your date of birth';
    } else {
      const birthDate = new Date(birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }

      if (actualAge < 14) {
        newErrors.birthday = lang === 'ar' 
          ? 'يجب أن يكون عمرك 14 عاماً على الأقل' 
          : 'You must be at least 14 years old';
      } else if (actualAge > 120) {
        newErrors.birthday = lang === 'ar'
          ? 'يرجى اختيار تاريخ ميلاد صحيح'
          : 'Please select a valid date of birth';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setGlobalError(null);
    setErrors({});
    
    try {
      // Reformat birthday from YYYY-MM-DD to DD:MM:YYYY (as required by backend regex)
      const [year, month, day] = birthday.split('-');
      const formattedBirthday = `${day}:${month}:${year}`;

      const res = await register({
        name,
        email,
        gender: gender as "male" | "female",
        birthday: formattedBirthday,
        languagePreference: lang,
      }, registerToken);
      
      console.log('Registration Response:', res);
      
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
        console.error('Registration success but no accessToken received!');
        setGlobalError(lang === 'ar' ? 'فشل استلام رمز الدخول' : 'Failed to receive access token');
      }
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      const desc = err.response?.data?.error?.message;
      
      if (code === 'VALIDATION_ERROR') {
        const details = err.response?.data?.error?.details || {};
        // Map backend validation to field errors
        const mappedErrors: Record<string, string> = {};
        for (const [key, msg] of Object.entries(details)) {
          let errorMsg = String(msg);
          if (key === 'birthday') {
            if (errorMsg.includes('invalid') || errorMsg.includes('validation.appBirthday.invalid') || errorMsg.includes('contains an invalid value')) {
              errorMsg = lang === 'ar' 
                ? 'يجب أن يكون عمرك 14 عاماً على الأقل' 
                : 'You must be at least 14 years old';
            } else if (errorMsg.includes('required') || errorMsg.includes('pattern')) {
              errorMsg = lang === 'ar' ? 'يرجى اختيار تاريخ ميلادك' : 'Please select your date of birth';
            }
          }
          mappedErrors[key] = errorMsg;
        }
        if (Object.keys(mappedErrors).length > 0) {
          setErrors(mappedErrors);
        } else {
          setGlobalError(desc || (lang === 'ar' ? 'بيانات غير صالحة' : 'Invalid data'));
        }
      } else if (code === 'EMAIL_TAKEN') {
        setErrors({ email: lang === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email is already taken' });
      } else {
        setGlobalError(desc || (lang === 'ar' ? 'تعذر إنشاء حسابك. يرجى التحقق من اتصالك والمحاولة مرة أخرى.' : 'We couldn\'t create your account. Please check your connection or try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label htmlFor="name" className="wf-uppercase-label !text-[10px] mb-2 block text-foreground/60">
          {lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          placeholder={lang === 'ar' ? 'مثال: أحمد علي' : 'e.g., Ahmed Ali'}
          className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-foreground/5 transition-all outline-none text-foreground font-medium ${errors.name ? 'border-secondary-red' : 'border-border'}`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="wf-uppercase-label !text-[10px] mb-2 block text-foreground/60">
          {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          dir="ltr"
          placeholder="name@example.com"
          className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-foreground/5 transition-all outline-none text-foreground font-medium ${errors.email ? 'border-secondary-red' : 'border-border'}`}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className="wf-uppercase-label !text-[10px] mb-2 block text-foreground/60">
            {lang === 'ar' ? 'الجنس' : 'Gender'}
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                id="gender"
                disabled={isLoading}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-foreground/5 transition-all text-foreground font-medium ${errors.gender ? 'border-secondary-red' : 'border-border'}`}
              >
                <span className={!gender ? 'text-gray-400' : ''}>
                  {!gender 
                    ? (lang === 'ar' ? 'اختر الجنس...' : 'Select gender...') 
                    : (gender === 'male' ? (lang === 'ar' ? 'ذكر' : 'Male') : (lang === 'ar' ? 'أنثى' : 'Female'))
                  }
                </span>
                <AltArrowDown size={18} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[150px] bg-white rounded-lg border border-border p-1 z-[100]">
              <DropdownMenuItem 
                onClick={() => setGender("male")}
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-900 outline-none"
              >
                {lang === 'ar' ? 'ذكر' : 'Male'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setGender("female")}
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-900 outline-none"
              >
                {lang === 'ar' ? 'أنثى' : 'Female'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
        </div>

        <div>
          <label htmlFor="birthday" className="wf-uppercase-label !text-[10px] mb-2 block text-foreground/60">
            {lang === 'ar' ? 'تاريخ الميلاد' : 'Birthday'}
          </label>
          <input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            disabled={isLoading}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-foreground/5 transition-all outline-none text-foreground font-medium ${errors.birthday ? 'border-secondary-red' : 'border-border'}`}
          />
          {errors.birthday && <p className="mt-1 text-sm text-red-600">{errors.birthday}</p>}
        </div>
      </div>

      {globalError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{globalError}</div>}

      <Button
        type="submit"
        isLoading={isLoading}
        loadingText={lang === 'ar' ? 'جاري الإنشاء...' : 'Creating Account...'}
        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-md mt-6 transition-all shadow-lg shadow-brand-500/20"
      >
        {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
      </Button>
    </form>
  );
}
