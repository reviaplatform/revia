"use client";

import React from 'react';
import { Profile } from '@/lib/api/types';
import { useLocation } from '@/hooks/useLocation';

interface ProfileViewProps {
  profile: Profile;
  lang: "en" | "ar";
  onSuccess?: () => void;
}

const parseDate = (dateStr: string) => {
  if (!dateStr) return null;
  // Handle DD:MM:YYYY
  if (dateStr.includes(':')) {
    const [d, m, y] = dateStr.split(':');
    const date = new Date(`${y}-${m}-${d}`);
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

export default function ProfileView({ profile, lang, onSuccess }: ProfileViewProps) {
  const isAr = lang === 'ar';
  
  const birthdayDate = parseDate(profile.birthday);
  const joinedDate = parseDate(profile.createdAt);

  const { requestAndSave, clearLocation, isLoading, state: locState } = useLocation(profile.location, {
    onSaved: () => onSuccess?.(),
    onCleared: () => onSuccess?.(),
  });

  return (
    <div className="bg-white p-8 sm:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <h2 className="wf-uppercase-label !text-[11px] text-foreground/40 mb-8 block">
        {isAr ? 'المعلومات الأساسية' : 'Basic Information'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div>
          <label className="wf-uppercase-label !text-[10px] text-brand-500 mb-2 block">
            {isAr ? 'رقم الهاتف' : 'Phone Number'}
          </label>
          <div className="flex items-center text-foreground font-medium">
            <span className="bg-brand-500/5 text-brand-500 px-4 py-2 rounded-md inline-flex items-center gap-2.5 border border-brand-500/10" dir="ltr">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {profile.phoneNumber}
            </span>
          </div>
        </div>

        <div>
          <label className="wf-uppercase-label !text-[10px] text-brand-500 mb-2 block">
            {isAr ? 'الجنس' : 'Gender'}
          </label>
          <div className="text-foreground font-semibold bg-foreground/5 px-4 py-2 rounded-md flex items-center w-fit gap-2.5 border border-border">
             <svg className="w-4 h-4 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            {profile.gender === 'male' && (isAr ? 'ذكر' : 'Male')}
            {profile.gender === 'female' && (isAr ? 'أنثى' : 'Female')}
          </div>
        </div>

        <div>
          <label className="wf-uppercase-label !text-[10px] text-brand-500 mb-2 block">
            {isAr ? 'تاريخ الميلاد' : 'Birthday'}
          </label>
          <div className="text-foreground font-semibold bg-foreground/5 px-4 py-2 rounded-md flex items-center w-fit gap-2.5 border border-border">
            <svg className="w-4 h-4 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span dir="ltr">
              {birthdayDate ? birthdayDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : (isAr ? 'غير محدد' : 'Not set')}
            </span>
          </div>
        </div>

        <div>
          <label className="wf-uppercase-label !text-[10px] text-brand-500 mb-2 block">
            {isAr ? 'الموقع الجغرافي' : 'Location Coordinates'}
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {profile.location ? (
              <div className="flex items-center text-foreground font-medium" dir="ltr">
                <span className="bg-brand-500/5 text-brand-500 px-4 py-2 rounded-md inline-flex items-center gap-2.5 border border-brand-500/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.location.latitude.toFixed(5)}, {profile.location.longitude.toFixed(5)}
                </span>
              </div>
            ) : (
              <span className="text-foreground/45 font-semibold bg-foreground/5 px-4 py-2 rounded-md inline-flex items-center gap-2.5 border border-border">
                <svg className="w-4 h-4 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {isAr ? 'غير محدد' : 'Not set'}
              </span>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={requestAndSave}
                disabled={isLoading}
                type="button"
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                {isLoading && locState.status === 'requesting' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isAr ? 'جاري التحديد...' : 'Detecting...'}
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isAr ? 'تحديد موقعي' : 'Detect GPS'}
                  </>
                )}
              </button>

              {profile.location && (
                <button
                  onClick={clearLocation}
                  disabled={isLoading}
                  type="button"
                  className="border border-secondary-red/20 hover:border-secondary-red/40 text-secondary-red hover:bg-secondary-red/5 disabled:opacity-50 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {isAr ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>
          </div>
          {(locState.status === 'denied' || locState.status === 'error') && (
            <p className="text-[10px] text-secondary-red font-semibold mt-1 tracking-tight">
              {locState.status === 'denied' ? locState.reason : locState.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
