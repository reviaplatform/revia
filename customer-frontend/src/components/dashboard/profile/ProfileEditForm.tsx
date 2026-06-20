"use client";

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/api/types';
import { updateProfile } from '@/lib/api/profile';
import { AltArrowDown } from '@solar-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface ProfileEditFormProps {
  profile: Profile;
  lang: "en" | "ar";
  onSuccess: () => void;
}

export default function ProfileEditForm({ profile, lang, onSuccess }: ProfileEditFormProps) {
  const isAr = lang === 'ar';

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email || '');
  const [prefLang, setPrefLang] = useState<"en" | "ar">(profile.languagePreference || 'ar');
  const [latitude, setLatitude] = useState(profile.location?.latitude !== undefined && profile.location !== null ? String(profile.location.latitude) : '');
  const [longitude, setLongitude] = useState(profile.location?.longitude !== undefined && profile.location !== null ? String(profile.location.longitude) : '');
  const [isDetecting, setIsDetecting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const successRef = React.useRef<HTMLDivElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.out", force3D: true }
    });

    // Entrance animation for the container and header
    tl.from(".profile-header", {
      y: 20,
      autoAlpha: 0,
    })
    // Staggered entrance for form fields (starts slightly after header)
    .from(".form-field", {
      y: 30,
      autoAlpha: 0,
      stagger: 0.1,
    }, "-=0.6")
    // Button entrance (starts right after form fields)
    .from(".form-footer", {
      autoAlpha: 0,
      y: 20,
    }, "-=0.4");
  }, { scope: containerRef });

  // Animate success message
  useGSAP(() => {
    if (successMessage) {
      gsap.fromTo(successRef.current, 
        { height: 0, autoAlpha: 0, marginBottom: 0, y: -10 },
        { height: "auto", autoAlpha: 1, marginBottom: 32, y: 0, duration: 0.4, ease: "back.out(1.7)", force3D: true }
      );
    }
  }, { dependencies: [successMessage], scope: containerRef });

  // Animate global error message
  useGSAP(() => {
    if (globalError) {
      gsap.fromTo(errorRef.current, 
        { height: 0, autoAlpha: 0, marginBottom: 0, y: -10 },
        { height: "auto", autoAlpha: 1, marginBottom: 32, y: 0, duration: 0.4, ease: "power2.out", force3D: true }
      );
    }
  }, { dependencies: [globalError], scope: containerRef });

  // Sync state if profile prop changes
  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email || '');
    setPrefLang(profile.languagePreference || 'ar');
    setLatitude(profile.location?.latitude !== undefined && profile.location !== null ? String(profile.location.latitude) : '');
    setLongitude(profile.location?.longitude !== undefined && profile.location !== null ? String(profile.location.longitude) : '');
  }, [profile]);

  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setGlobalError(isAr ? 'تحديد الموقع غير مدعوم في متصفحك' : 'Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setGlobalError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setIsDetecting(false);
      },
      (err) => {
        let msg = isAr ? 'تم رفض إذن الوصول للموقع.' : 'Location access was denied.';
        if (err.code === err.POSITION_UNAVAILABLE) msg = isAr ? 'معلومات الموقع غير متوفرة.' : 'Location information is unavailable.';
        if (err.code === err.TIMEOUT) msg = isAr ? 'انتهت مهلة طلب تحديد الموقع.' : 'The request to get your location timed out.';
        setGlobalError(msg);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = isAr ? 'الاسم مطلوب' : 'Name is required';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = isAr ? 'البريد الإلكتروني غير صالح' : 'Invalid email';

    const latStr = latitude.trim();
    const lngStr = longitude.trim();

    if (latStr || lngStr) {
      if (!latStr || !lngStr) {
        const msg = isAr ? 'يجب إدخال خطوط الطول ودائرة العرض معاً' : 'Both Latitude and Longitude must be entered';
        if (!latStr) newErrors.latitude = msg;
        if (!lngStr) newErrors.longitude = msg;
      } else {
        const latVal = parseFloat(latStr);
        const lngVal = parseFloat(lngStr);

        if (isNaN(latVal) || latVal < -90 || latVal > 90) {
          newErrors.latitude = isAr 
            ? 'خط العرض يجب أن يكون رقماً بين -90 و 90' 
            : 'Latitude must be a valid number between -90 and 90';
        }
        if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
          newErrors.longitude = isAr 
            ? 'خط الطول يجب أن يكون رقماً بين -180 و 180' 
            : 'Longitude must be a valid number between -180 and 180';
        }
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
    setSuccessMessage(null);
    setErrors({});

    const payload: any = {};
    if (name !== profile.name) payload.name = name;
    if (email !== (profile.email || '')) payload.email = email || undefined;
    if (prefLang !== profile.languagePreference) payload.languagePreference = prefLang;

    const currentLat = profile.location?.latitude !== undefined && profile.location !== null ? String(profile.location.latitude) : '';
    const currentLng = profile.location?.longitude !== undefined && profile.location !== null ? String(profile.location.longitude) : '';
    if (latitude !== currentLat || longitude !== currentLng) {
      const latVal = latitude.trim() ? parseFloat(latitude) : null;
      const lngVal = longitude.trim() ? parseFloat(longitude) : null;
      if (latVal !== null && lngVal !== null) {
        payload.location = { latitude: latVal, longitude: lngVal };
      } else {
        payload.location = null;
      }
    }

    if (Object.keys(payload).length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      await updateProfile(payload);

      setSuccessMessage(isAr ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
      onSuccess();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      const desc = err.response?.data?.error?.message;

      if (code === 'VALIDATION_ERROR') {
        const details = err.response?.data?.error?.details || {};
        const mappedErrors: Record<string, string> = {};
        for (const [key, msg] of Object.entries(details)) {
          mappedErrors[key] = String(msg);
        }
        if (Object.keys(mappedErrors).length > 0) {
          setErrors(mappedErrors);
        } else {
          setGlobalError(desc || (isAr ? 'بيانات غير صالحة' : 'Invalid data'));
        }
      } else if (code === 'EMAIL_TAKEN') {
        setErrors({ email: isAr ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email is already taken' });
      } else {
        setGlobalError(desc || (isAr ? 'حدث خطأ في التحديث' : 'Failed to update profile'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-white p-8">
      <h2 className="profile-header wf-uppercase-label !text-[11px] text-foreground/40 mb-8 block will-change-transform-opacity">
        {isAr ? 'تعديل الملف الشخصي' : 'Personal Identity'}
      </h2>

      {successMessage && (
        <div ref={successRef} className="overflow-hidden will-change-transform-opacity">
          <div className="p-4 bg-secondary-green/5 border border-secondary-green/10 text-secondary-green rounded-md flex items-center gap-3 text-sm font-semibold tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary-green" />
            {successMessage}
          </div>
        </div>
      )}

      {globalError && (
        <div ref={errorRef} className="overflow-hidden will-change-transform-opacity">
          <div className="p-4 bg-secondary-red/5 border border-secondary-red/10 text-secondary-red rounded-md flex items-center gap-3 text-sm font-semibold tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary-red" />
            {globalError}
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          <div className="form-field will-change-transform-opacity">
            <label htmlFor="name" className="wf-uppercase-label !text-[10px] text-foreground/40 mb-3 block">
              {isAr ? 'الاسم' : 'Full Name'}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              dir={isAr ? 'rtl' : 'ltr'}
              className={`w-full px-5 py-4 border rounded-md text-foreground font-semibold text-[15px] focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 disabled:bg-foreground/[0.02] transition-all tracking-tight ${errors.name ? 'border-secondary-red/50 bg-secondary-red/[0.02]' : 'border-border bg-white'}`}
            />
            {errors.name && <p className="mt-2 text-[11px] text-secondary-red font-bold uppercase tracking-widest">{errors.name}</p>}
          </div>

          <div className="form-field will-change-transform-opacity">
            <label htmlFor="email" className="wf-uppercase-label !text-[10px] text-foreground/40 mb-3 block">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              dir="ltr"
              className={`w-full px-5 py-4 border rounded-md text-foreground font-semibold text-[15px] focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 disabled:bg-foreground/[0.02] transition-all tracking-tight ${errors.email ? 'border-secondary-red/50 bg-secondary-red/[0.02]' : 'border-border bg-white'}`}
            />
            {errors.email && <p className="mt-2 text-[11px] text-secondary-red font-bold uppercase tracking-widest">{errors.email}</p>}
          </div>

          <div className="form-field will-change-transform-opacity">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="latitude" className="wf-uppercase-label !text-[10px] text-foreground/40 block">
                {isAr ? 'خط العرض (موقع)' : 'Latitude'}
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetecting || isLoading}
                className="text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                {isDetecting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isAr ? 'جاري تحديد...' : 'Detecting...'}
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {isAr ? 'تحديد تلقائي' : 'Detect GPS'}
                  </>
                )}
              </button>
            </div>
            <input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 30.0444"
              disabled={isLoading || isDetecting}
              dir="ltr"
              className={`w-full px-5 py-4 border rounded-md text-foreground font-semibold text-[15px] focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 disabled:bg-foreground/[0.02] transition-all tracking-tight ${errors.latitude ? 'border-secondary-red/50 bg-secondary-red/[0.02]' : 'border-border bg-white'}`}
            />
            {errors.latitude && <p className="mt-2 text-[11px] text-secondary-red font-bold uppercase tracking-widest">{errors.latitude}</p>}
          </div>

          <div className="form-field will-change-transform-opacity">
            <label htmlFor="longitude" className="wf-uppercase-label !text-[10px] text-foreground/40 mb-3 block">
              {isAr ? 'خط الطول (موقع)' : 'Longitude'}
            </label>
            <input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. 31.2357"
              disabled={isLoading || isDetecting}
              dir="ltr"
              className={`w-full px-5 py-4 border rounded-md text-foreground font-semibold text-[15px] focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 disabled:bg-foreground/[0.02] transition-all tracking-tight ${errors.longitude ? 'border-secondary-red/50 bg-secondary-red/[0.02]' : 'border-border bg-white'}`}
            />
            {errors.longitude && <p className="mt-2 text-[11px] text-secondary-red font-bold uppercase tracking-widest">{errors.longitude}</p>}
          </div>
        </div>

        <div className="form-footer pt-8 flex justify-end will-change-transform-opacity">
          <Button
            type="submit"
            isLoading={isLoading}
            loadingText={isAr ? 'جاري الحفظ...' : 'Saving Changes...'}
            disabled={
              name === profile.name &&
              email === (profile.email || '') &&
              prefLang === profile.languagePreference &&
              latitude === (profile.location?.latitude !== undefined && profile.location !== null ? String(profile.location.latitude) : '') &&
              longitude === (profile.location?.longitude !== undefined && profile.location !== null ? String(profile.location.longitude) : '')
            }
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-4 rounded-md shadow-sm shadow-brand-500/20 text-sm uppercase tracking-widest"
          >
            {isAr ? 'حفظ التغييرات' : 'Update Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
