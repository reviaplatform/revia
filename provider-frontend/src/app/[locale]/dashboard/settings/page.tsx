"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  User,
  Global,
  Diskette,
  UserCheck,
  Settings,
  Camera,
  Shop
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';

type SettingsTab = 'profile' | 'preferences';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div 
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-24 md:pb-8"
    >
      <div className="pb-6 border-b border-wf-border flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
              <Settings className="size-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
              {t('title')}
            </h1>
          </div>
          <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-widest opacity-40">
          <div className="flex items-center gap-2">
            <div className="size-1 bg-emerald-500 rounded-full" />
            {t('status.active')}
          </div>
          <div className="flex items-center gap-2">
            <div className="size-1 bg-blue-500 rounded-full" />
            {t('status.authorized')}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Nav */}
        <div className="w-full md:w-72 h-fit p-1.5 space-y-2 bg-slate-50 border border-wf-border rounded-wf shadow-none">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={<User className="size-4" />}
            label={t('tabs.profile')}
          />
          <TabButton
            active={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')} 
            icon={<Global className="size-4" />} 
            label={t('tabs.preferences')} 
          />

        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 max-w-4xl space-y-12 animate-in fade-in duration-500",
          locale === 'ar' ? "slide-in-from-left-4" : "slide-in-from-right-4"
        )}>
          {isLoading ? (
            <Card className="p-8 md:p-12 bg-white border border-wf-border rounded-wf shadow-none overflow-hidden relative">
              <div className="mb-12 flex flex-col md:flex-row items-center gap-10">
                <Skeleton className="size-28 rounded-wf" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                </div>
              </div>
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-14 w-full rounded-wf" /></div>
                  <div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-14 w-full rounded-wf" /></div>
                </div>
                <div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-14 w-full rounded-wf" /></div>
                <div className="pt-6 border-t border-wf-border"><Skeleton className="h-14 w-48 rounded-wf" /></div>
              </div>
            </Card>
          ) : (
            <>
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'preferences' && <PreferenceSettings />}

            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  const locale = useLocale();
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 rounded-wf text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 border",
        active 
          ? 'bg-white text-wf-near-black border-wf-border shadow-none' 
          : 'text-wf-gray-300 hover:text-swf-gray-700 border-transparent hover:bg-white/50'
      )}
    >
      <div className={cn(
        "shrink-0 transition-colors",
        active ? "text-primary" : "opacity-40"
      )}>
        {icon}
      </div>
      <span className="text-start">{label}</span>
      {active && <div className={cn("size-1.5 bg-primary rounded-full animate-pulse", locale === 'ar' ? "mr-auto" : "ml-auto")} />}
    </button>
  );
}

function ProfileSettings() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const { user, brand, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiClient.put('/me', { name, email });
      setUser(res.data.data);
      toast.success(t('messages.updateSuccess'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 md:p-12 bg-white border border-wf-border rounded-wf shadow-none overflow-hidden relative group text-start">
      <div className={cn(
        "absolute top-0 w-64 h-64 bg-slate-50 border-wf-border rounded-bl-[120px] -mt-20 group-hover:bg-primary/5 transition-colors duration-700",
        locale === 'ar' ? "left-0 border-r border-b -ml-20" : "right-0 border-l border-b -mr-20"
      )} />
      
      <div className="mb-12 flex flex-col md:flex-row items-center gap-10 relative z-10">
        <div className="relative group/avatar">
          <div className="size-28 rounded-wf bg-white border border-wf-border flex items-center justify-center overflow-hidden transition-all duration-500 group-hover/avatar:border-primary">
            {brand?.logo ? (
              <img src={brand.logo} alt="Brand Logo" className="w-full h-full object-contain p-4" />
            ) : (
              <Shop className="size-10 text-wf-gray-300 opacity-20" />
            )}
          </div>
          <div className={cn(
            "absolute -bottom-2 size-8 bg-wf-near-black text-white rounded-wf border border-white flex items-center justify-center cursor-pointer hover:bg-primary transition-all",
            locale === 'ar' ? "-left-2" : "-right-2"
          )}>
            <Camera className="size-4" />
          </div>
        </div>
        <div className="text-center md:text-start space-y-1">
          <h2 className="text-2xl font-black text-wf-near-black tracking-tighter uppercase">{(locale === 'ar' ? brand?.name?.ar : brand?.name?.en) || t('profile.title')}</h2>
          <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-widest opacity-60">{t('profile.desc')}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.25em]">{t('profile.fullName')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf" placeholder="User Name" required />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.25em]">{t('profile.email')}</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf" placeholder="user@example.com" required />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.25em]">{t('profile.phone')}</label>
          <div className="relative">
            <Input defaultValue={user?.phoneNumber || ''} disabled className={cn("h-14 bg-slate-50 border-wf-border opacity-50 font-black uppercase tracking-widest text-xs rounded-wf", locale === 'ar' ? "pl-12" : "pr-12")} />
            <UserCheck className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-emerald-500", locale === 'ar' ? "left-4" : "right-4")} />
          </div>
          <p className="text-[9px] text-wf-gray-300 font-black uppercase tracking-widest opacity-40">{t('profile.phoneDesc')}</p>
        </div>
        <div className="pt-4 border-t border-wf-border">
          <Button type="submit" isLoading={isLoading} className="h-14 px-10 rounded-wf font-black uppercase tracking-widest bg-primary text-white shadow-none border-b-4 border-primary/20 transition-all active:border-b-0 active:translate-y-1">
            <Diskette className={cn("size-4", locale === 'ar' ? "ml-3" : "mr-3")} />
            {t('profile.save')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PreferenceSettings() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { setUser } = useAuth();

  const handleLanguageChange = async (newLocale: string) => {
    try {
      const res = await apiClient.put('/me', { languagePreference: newLocale });
      setUser(res.data.data);
    } catch (error) {
      console.error('Failed to persist language preference', error);
    }
    router.replace(pathname, { locale: newLocale as any });
  };

  return (
    <Card className="p-8 md:p-12 bg-white border border-wf-border rounded-wf shadow-none text-start">
      <div className="mb-10 space-y-1">
        <h2 className="text-xl font-black text-wf-near-black uppercase tracking-tight">{t('preferences.title')}</h2>
        <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-widest opacity-60">{t('preferences.desc')}</p>
      </div>
      <div className="space-y-10 max-w-xl">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.2em]">{t('preferences.language')}</label>
          <Select defaultValue={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-14 bg-slate-50 border-wf-border font-black uppercase tracking-widest text-[11px] rounded-wf">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-wf border-wf-border">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}


