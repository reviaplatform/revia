"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Device, CreateRepairPayload } from '@/lib/api/types';
import { getDevices } from '@/lib/api/devices';
import { createRepair } from '@/lib/api/repairs';
import { useProfile } from '@/hooks/useProfile';
import { useLocation } from '@/hooks/useLocation';
import { Smartphone, AltArrowDown, CloseCircle, Upload, Stars, Plain, Gallery, Camera, Microphone, MonitorCamera } from '@solar-icons/react';
import VoiceRecorder from '@/components/media/VoiceRecorder';
import CameraCapture from '@/components/media/CameraCapture';
import ScreenCapture from '@/components/media/ScreenCapture';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

interface CreateRepairFormProps {
  lang: 'en' | 'ar';
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateRepairSkeleton() {
  return (
    <div className="space-y-6 bg-foreground/[0.02] p-6 rounded-lg border border-border animate-pulse">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 w-32 bg-foreground/10 rounded-md" />
        <div className="h-6 w-6 bg-foreground/10 rounded-full" />
      </div>

      <div className="space-y-4">
        {/* Device Selection Skeleton */}
        <div>
          <div className="h-4 w-24 bg-foreground/10 rounded mb-2" />
          <div className="h-12 w-full bg-foreground/[0.02] rounded-md border border-border" />
        </div>

        {/* Issue Description Skeleton */}
        <div>
          <div className="h-4 w-28 bg-foreground/10 rounded mb-2" />
          <div className="h-32 w-full bg-foreground/[0.02] rounded-md" />
        </div>

        {/* Image Placeholder Skeleton */}
        <div className="h-20 w-full bg-white border border-dashed border-border rounded-md" />

        <div className="flex gap-4 pt-2">
          <div className="flex-1 h-12 bg-foreground/[0.02] rounded-md" />
          <div className="flex-[2] h-12 bg-foreground/10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function CreateRepairForm({ lang, onSuccess, onCancel }: CreateRepairFormProps) {
  const isAr = lang === 'ar';
  const router = useRouter();
  
  const { profile, isLoading: isProfileLoading, refetch: refetchProfile } = useProfile();
  
  const { requestAndSave, saveManualLocation, isLoading: isLocLoading, state: locState } = useLocation(
    profile?.location,
    {
      onSaved: () => refetchProfile(),
    }
  );

  const [showManualInputs, setShowManualInputs] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const [flow, setFlow] = useState<'direct' | 'ai_chat'>('ai_chat');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [issueText, setIssueText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devicesData = await getDevices() || [];
        setDevices(devicesData);
        if (devicesData.length > 0) {
          setSelectedDevice(devicesData[0]);
        }
      } catch (err) {
        console.error('Failed to fetch devices', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) {
      setError(isAr ? 'يرجى اختيار جهاز' : 'Please select a device');
      return;
    }
    if (!profile?.location) {
      setError(isAr ? 'يرجى تحديد الموقع الجغرافي للمتابعة' : 'Please set your location to proceed');
      return;
    }
    if (!issueText.trim()) {
      setError(isAr ? 'يرجى وصف المشكلة' : 'Please describe the issue');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createRepair({
        deviceId: selectedDevice.id,
        issueText,
        flow,
        attachments,
      });
      
      // Go to details page for both, but auto-open chat only for ai_chat
      if (flow === 'ai_chat') {
        router.push(`/${lang}/dashboard/repairs/${result.id}?autoOpenChat=true&firstMsg=true`);
      } else {
        router.push(`/${lang}/dashboard/repairs/${result.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || (isAr ? 'فشل إنشاء الطلب' : 'Failed to create request'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isProfileLoading) {
    return <CreateRepairSkeleton />;
  }

  if ((devices || []).length === 0) {
    return (
      <div className="bg-brand-500/5 border border-brand-500/10 rounded-lg p-12 text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500">
          <Smartphone size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-lg tracking-tight">
            {isAr ? 'لا توجد أجهزة مضافة' : 'No Devices Found'}
          </h3>
          <p className="text-xs text-foreground/40 font-medium max-w-xs leading-relaxed">
            {isAr 
              ? 'يجب عليك إضافة جهاز أولاً قبل طلب الصيانة لتتمكن من اختيار العطل المناسب.' 
              : 'You need to add a device first before you can request a professional repair.'}
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="wf-uppercase-label !text-[11px] text-brand-500 hover:text-brand-600 transition-colors"
        >
          {isAr ? 'رجوع' : 'Go Back'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-foreground/[0.01] p-8 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-black text-foreground tracking-tight">
          {isAr ? 'طلب صيانة جديد' : 'New Repair Request'}
        </h3>
        <button type="button" onClick={onCancel} className="text-foreground/20 hover:text-foreground/40 transition-colors">
          <CloseCircle size={28} />
        </button>
      </div>

      <div className="space-y-8">
        {/* Device Selection */}
        <div>
          <label className="wf-uppercase-label !text-[11px] text-foreground/40 mb-3 block">
            {isAr ? 'اختر الجهاز' : 'Select Device'}
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-5 py-4 border border-border rounded-md bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 transition-all text-foreground font-semibold text-[15px]"
              >
                <div className="flex items-center gap-4 text-left">
                  <Smartphone size={20} className="text-brand-500 opacity-60" />
                  <span className="tracking-tight">{selectedDevice?.name || (isAr ? 'اختر الجهاز للتكملة...' : 'Select device to proceed...')}</span>
                </div>
                <AltArrowDown size={18} className="text-foreground/20" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white rounded-md border-border p-1 z-[60]">
              {devices.map((device) => (
                <DropdownMenuItem 
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className="cursor-pointer hover:bg-foreground/[0.02] focus:bg-foreground/[0.02] px-4 py-3 rounded-sm text-sm flex items-center gap-4 text-foreground outline-none transition-colors"
                >
                  <Smartphone size={18} className="text-foreground/30" />
                  <div>
                    <div className="font-bold tracking-tight">{device.name}</div>
                    <div className="text-[10px] text-foreground/30 font-semibold uppercase tracking-widest mt-0.5">{device.deviceModel}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Location Verification & Requirements */}
        <div className="border border-border rounded-md p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <label className="wf-uppercase-label !text-[11px] text-foreground/40 block">
              {isAr ? 'موقع تقديم الخدمة' : 'Service Location'}
            </label>
            {profile?.location && (
              <span className="text-[10px] font-bold text-secondary-green bg-secondary-green/5 border border-secondary-green/10 px-2 py-0.5 rounded uppercase tracking-wider">
                {isAr ? 'مؤكد' : 'Set'}
              </span>
            )}
          </div>

          {profile?.location ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-foreground font-semibold text-[14px]">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div dir="ltr">
                  {profile.location.latitude.toFixed(5)}, {profile.location.longitude.toFixed(5)}
                </div>
              </div>

              {!showManualInputs ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={requestAndSave}
                    disabled={isLocLoading}
                    className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    {isLocLoading && locState.status === 'requesting' ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {isAr ? 'جاري التحديد...' : 'Updating GPS...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                        </svg>
                        {isAr ? 'تحديث تلقائي' : 'Detect GPS'}
                      </>
                    )}
                  </button>
                  <span className="text-foreground/10">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setManualLat(String(profile.location?.latitude || ''));
                      setManualLng(String(profile.location?.longitude || ''));
                      setShowManualInputs(true);
                    }}
                    className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase tracking-wider"
                  >
                    {isAr ? 'تعديل يدوي' : 'Edit Manually'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowManualInputs(false);
                    setManualError(null);
                  }}
                  className="text-xs font-bold text-foreground/40 hover:text-foreground/60 transition-colors uppercase tracking-wider"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-secondary-red/5 border border-secondary-red/10 rounded-md p-4 space-y-4">
              <div className="flex items-start gap-3 text-secondary-red">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="space-y-1">
                  <div className="font-bold text-[13px] tracking-tight">
                    {isAr ? 'الموقع مطلوب لمتابعة الطلب' : 'Location coordinates are required'}
                  </div>
                  <div className="text-[11px] text-secondary-red/80 font-medium leading-relaxed">
                    {isAr
                      ? 'نحتاج لموقعك لمطابقتك مع أقرب مراكز صيانة مؤهلة وتسهيل عملية النقل.'
                      : 'We need your location coordinates to match you with the nearest eligible service providers.'}
                  </div>
                </div>
              </div>

              {!showManualInputs && (
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={requestAndSave}
                    disabled={isLocLoading}
                    className="bg-secondary-red hover:bg-secondary-red/90 disabled:bg-secondary-red/50 text-white font-bold text-[11px] px-4 py-2 rounded uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-secondary-red/20"
                  >
                    {isLocLoading && locState.status === 'requesting' ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {isAr ? 'جاري تحديد موقعك...' : 'Detecting GPS...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {isAr ? 'تحديد موقعي التلقائي' : 'Detect Current GPS'}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualInputs(true)}
                    className="border border-secondary-red/20 hover:border-secondary-red/40 text-secondary-red hover:bg-secondary-red/5 font-bold text-[11px] px-4 py-2 rounded uppercase tracking-wider transition-colors"
                  >
                    {isAr ? 'إدخل يدوي' : 'Enter Manually'}
                  </button>
                </div>
              )}
            </div>
          )}

          {showManualInputs && (
            <div className="bg-foreground/[0.02] border border-border rounded-md p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="wf-uppercase-label !text-[9px] text-foreground/40 mb-2 block">
                    {isAr ? 'خط العرض' : 'Latitude'}
                  </label>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="30.0444"
                    dir="ltr"
                    className="w-full px-3 py-2 border border-border rounded bg-white text-foreground font-semibold text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="wf-uppercase-label !text-[9px] text-foreground/40 mb-2 block">
                    {isAr ? 'خط الطول' : 'Longitude'}
                  </label>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="31.2357"
                    dir="ltr"
                    className="w-full px-3 py-2 border border-border rounded bg-white text-foreground font-semibold text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {manualError && (
                <p className="text-[10px] text-secondary-red font-bold uppercase tracking-widest">{manualError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setManualError(null);
                    const latVal = parseFloat(manualLat.trim());
                    const lngVal = parseFloat(manualLng.trim());
                    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
                      setManualError(isAr ? 'خط العرض غير صالح (-90 إلى 90)' : 'Invalid Latitude (-90 to 90)');
                      return;
                    }
                    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
                      setManualError(isAr ? 'خط الطول غير صالح (-180 إلى 180)' : 'Invalid Longitude (-180 to 180)');
                      return;
                    }
                    
                    try {
                      await saveManualLocation(latVal, lngVal);
                      setShowManualInputs(false);
                    } catch (e) {
                      setManualError(isAr ? 'فشل حفظ الموقع' : 'Failed to save location');
                    }
                  }}
                  disabled={isLocLoading}
                  className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-bold text-[10px] px-4 py-2 rounded uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  {isLocLoading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {isAr ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    isAr ? 'حفظ الموقع' : 'Save Location'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowManualInputs(false);
                    setManualError(null);
                  }}
                  className="border border-border bg-white hover:bg-foreground/[0.02] text-foreground/60 font-bold text-[10px] px-4 py-2 rounded uppercase tracking-wider transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          {(locState.status === 'denied' || locState.status === 'error') && !showManualInputs && (
            <p className="text-[10px] text-secondary-red font-semibold tracking-tight">
              {locState.reason}
            </p>
          )}
        </div>

        {/* Flow Selection */}
        <div>
          <label className="wf-uppercase-label !text-[11px] text-foreground/40 mb-3 block">
            {isAr ? 'طريقة الصيانة' : 'Repair Method'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFlow('ai_chat')}
              className={cn(
                "p-5 rounded-md border-2 text-left transition-all flex flex-col gap-3 group relative overflow-hidden active:scale-95 hover-translate",
                flow === 'ai_chat' 
                  ? "border-brand-500 bg-brand-500/5" 
                  : "border-border bg-white hover:border-brand-500/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn("w-12 h-12 rounded-md flex items-center justify-center transition-all", flow === 'ai_chat' ? "bg-brand-500 text-white" : "bg-foreground/[0.03] text-foreground/20 group-hover:bg-brand-500/10 group-hover:text-brand-500")}>
                  <Stars size={24} />
                </div>
                {flow === 'ai_chat' && <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-[15px] text-foreground tracking-tight">{isAr ? 'تشخيص ذكي' : 'AI Diagnostic'}</div>
                <div className="text-[11px] text-foreground/40 font-medium leading-relaxed">{isAr ? 'دردشة مع الذكاء الاصطناعي لتحديد العطل بدقة' : 'Chat with AI to identify the exact issue first'}</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFlow('direct')}
              className={cn(
                "p-5 rounded-md border-2 text-left transition-all flex flex-col gap-3 group active:scale-95 hover-translate",
                flow === 'direct' 
                  ? "border-brand-500 bg-brand-500/5" 
                  : "border-border bg-white hover:border-brand-500/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn("w-12 h-12 rounded-md flex items-center justify-center transition-all", flow === 'direct' ? "bg-brand-500 text-white" : "bg-foreground/[0.03] text-foreground/20 group-hover:bg-brand-500/10 group-hover:text-brand-500")}>
                  <Plain size={24} />
                </div>
                {flow === 'direct' && <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-[15px] text-foreground tracking-tight">{isAr ? 'طلب مباشر' : 'Direct Request'}</div>
                <div className="text-[11px] text-foreground/40 font-medium leading-relaxed">{isAr ? 'إرسال الطلب مباشرة لمراكز الصيانة' : 'Skip AI and send request directly to brands'}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Issue Description */}
        <div>
          <label className="wf-uppercase-label !text-[11px] text-foreground/40 mb-3 block">
            {isAr ? 'وصف المشكلة' : 'Issue Description'}
          </label>
          <textarea
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            required
            rows={4}
            className="w-full px-5 py-4 border border-border rounded-md focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 transition-all text-foreground font-semibold text-[15px] resize-none"
            placeholder={isAr ? 'صف العطل الذي تواجهه بالتفصيل...' : 'Describe the exact issue you are facing...'}
          />
        </div>

        {/* Multimedia Proof Section */}
        <div>
          <label className="wf-uppercase-label !text-[11px] text-foreground/40 mb-3 block">
            {isAr ? 'إثبات مرئي أو صوتي' : 'Visual or Audio Proof'}
          </label>
          
          {attachments.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {attachments.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-foreground/[0.02]">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-brand-500">
                      <Microphone size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? 'تسجيل' : 'Voice'}</span>
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-white/90 rounded-full text-secondary-red"
                  >
                    <CloseCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isRecording ? (
              <VoiceRecorder 
                onCapture={(file) => { setAttachments(prev => [...prev, file]); setIsRecording(false); }} 
                onCancel={() => setIsRecording(false)} 
                isAr={isAr} 
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => { if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]); }}
                  className="hidden"
                  accept="image/*,audio/*"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-md border border-border bg-white hover:border-brand-500/40 transition-all text-xs font-bold uppercase tracking-widest text-foreground/60"
                >
                  <Gallery size={18} className="text-brand-500" />
                  {isAr ? 'معرض الصور' : 'Gallery'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-md border border-border bg-white hover:border-brand-500/40 transition-all text-xs font-bold uppercase tracking-widest text-foreground/60"
                >
                  <Camera size={18} className="text-brand-500" />
                  {isAr ? 'الكاميرا' : 'Camera'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecording(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-md border border-border bg-white hover:border-brand-500/40 transition-all text-xs font-bold uppercase tracking-widest text-foreground/60"
                >
                  <Microphone size={18} className="text-brand-500" />
                  {isAr ? 'تسجيل صوتي' : 'Voice'}
                </button>
                <ScreenCapture onCapture={(file) => setAttachments(prev => [...prev, file])} isAr={isAr} />
              </div>
            )}
          </div>
        </div>

        {showCamera && (
          <CameraCapture 
            onCapture={(file) => { setAttachments(prev => [...prev, file]); setShowCamera(false); }} 
            onClose={() => setShowCamera(false)} 
            isAr={isAr} 
          />
        )}

        {error && (
          <div className="text-[11px] text-secondary-red font-bold bg-secondary-red/5 p-4 rounded-md border border-secondary-red/10 animate-shake flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-secondary-red" />
             {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 py-4 font-bold uppercase tracking-widest text-xs"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingVariant="morph"
            disabled={!profile?.location || isLocLoading}
            className="flex-[2] bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-bold py-4 rounded-md uppercase tracking-widest text-xs"
          >
            {isAr ? 'إرسال طلب الصيانة' : 'Initialize Request'}
          </Button>
        </div>
      </div>
    </form>
  );
}
