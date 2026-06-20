"use client";

import React from 'react';
import ProfileView from '@/components/dashboard/profile/ProfileView';
import ProfileEditForm from '@/components/dashboard/profile/ProfileEditForm';
import DeleteAccountSection from '@/components/dashboard/profile/DeleteAccountSection';
import { useProfile } from '@/hooks/useProfile';
import PageHeader from '@/components/dashboard/layout/PageHeader';

/* ─── Skeleton ────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* View Section Skeleton */}
      <div className="bg-white rounded-lg border border-border p-8 space-y-8">
        <div className="h-8 w-48 bg-foreground/5 rounded-md mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-foreground/5 rounded-sm" />
              <div className="h-9 w-32 bg-foreground/5 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form Skeleton */}
      <div className="bg-white rounded-lg border border-border p-8 space-y-8">
        <div className="h-8 w-48 bg-foreground/5 rounded-md mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-foreground/5 rounded-sm" />
              <div className="h-11 w-full bg-foreground/[0.02] border border-border rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <div className="h-12 w-36 bg-foreground/5 rounded-md" />
        </div>
      </div>

      {/* Danger Zone Skeleton */}
      <div className="bg-secondary-red/5 rounded-lg border border-secondary-red/10 p-8 space-y-4">
        <div className="h-6 w-40 bg-secondary-red/10 rounded-sm" />
        <div className="h-4 w-full bg-secondary-red/5 rounded-sm" />
        <div className="h-12 w-48 bg-secondary-red/10 rounded-md" />
      </div>
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ lang: 'en' | 'ar' }> }) {
  const { lang } = React.use(params);
  const isAr = lang === 'ar';
  
  const { profile, isLoading, error, refetch } = useProfile();

  if (error || (!profile && !isLoading)) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        <div className="bg-secondary-red/5 text-secondary-red p-10 rounded-lg border border-secondary-red/10 inline-block max-w-md w-full">
          <p className="font-bold text-lg mb-6 tracking-tight">{isAr ? 'حدث خطأ أثناء تحميل الملف الشخصي' : 'Failed to load profile'}</p>
          <button 
            onClick={() => refetch()}
            className="hover-translate bg-secondary-red text-white px-8 py-3 rounded-md font-bold transition-all hover:bg-secondary-red/90"
          >
            {isAr ? 'المحاولة مرة أخرى' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Page Header Banner ─────────────────────────────────── */}
      <PageHeader
        title={isAr ? 'الملف الشخصي' : 'My Profile'}
        label={isAr ? 'إعدادات الحساب' : 'Account Settings'}
        description={isAr 
          ? 'إدارة معلوماتك الشخصية وتفضيلات الحساب والأمان بكفاءة وسهولة من مكان واحد.' 
          : 'Centralized management for your personal identity, account preferences, and core security settings.'}
        isAr={isAr}
      />

      {/* ── Content Area ─────────────────────────────────────── */}
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <ProfileView profile={profile!} lang={lang} onSuccess={refetch} />
          </div>
          
          <div className="bg-white rounded-lg border border-border">
            <ProfileEditForm profile={profile!} lang={lang} onSuccess={refetch} />
          </div>
          
          <div className="bg-secondary-red/[0.02] rounded-lg border border-secondary-red/10">
            <DeleteAccountSection lang={lang} />
          </div>
        </div>
      )}
    </div>
  );
}
